# dimensionnements/utils.py
import math
from decimal import Decimal, ROUND_UP
from django.db.models import Q
from django.core.cache import cache

from equipements.models import Equipement
from dimensionnements.serializers import EquipementDetailSerializer

# =========================
#  Mapping des champs ORM
# =========================
# Adapte les noms "logiques" vers les VRAIS champs de ton modèle Equipement
FIELD_MAP = {
    "panneau_solaire": {
        "value": "puissance_W",     # critère dimensionnement PV (W)
        "vmp":   "vmp_V",
        "voc":   "voc_V",
        "vnom":  "tension_nominale_V",
    },
    "batterie": {
        "value": "capacite_Ah",     # critère dimensionnement batterie (Ah)
        "vnom":  "tension_nominale_V",
    },
    "onduleur": {
        "value": "puissance_W",     # critère dimensionnement onduleur (W)
    },
    "regulateur": {
        "value":    "courant_A",      # critère dimensionnement régulateur (A)
        "type":     "type_regulateur",# 'MPPT' / 'PWM'
        "voc_max":  "pv_voc_max_V",
        "mppt_min": "mppt_v_min_V",
        "mppt_max": "mppt_v_max_V",
    },
    "cable": {
        "ampacity": "ampacite_A",
        "price":    "prix_unitaire",
        "section":  "section_mm2",
    },
}

def f(categorie: str, key: str, default: str | None = None) -> str:
    """Retourne le vrai nom de champ pour une catégorie donnée, sinon `default`."""
    return FIELD_MAP.get(categorie, {}).get(key, default or key)

# =========================
#  Helpers / utilitaires
# =========================
def ceil_decimal(x: Decimal) -> int:
    """Arrondi supérieur pour Decimal -> int."""
    return int(x.to_integral_value(rounding=ROUND_UP))

def _prix_decimal(e):
    try:
        v = getattr(e, "prix_unitaire", 0)
        return Decimal(str(v)) if v is not None else Decimal("0")
    except Exception:
        return Decimal("0")
    
def _get_num(data, key, default="0"):
    try:
        return Decimal(str(data.get(key, default)))
    except Exception:
        return Decimal(str(default))

def _pick_cable_for_current(I_req: Decimal):
    """Retourne le câble le moins cher dont l’ampacité couvre I_req."""
    cables = Equipement.objects.filter(categorie__iexact='cable')
    amp_field = f("cable", "ampacity")
    cables = (cables
              .exclude(**{f"{amp_field}__isnull": True})
              .exclude(**{f"{amp_field}": 0}))
    cables_ok = cables.filter(**{f"{amp_field}__gte": I_req}).order_by('prix_unitaire')
    chosen = cables_ok.first()
    if not chosen:
        chosen = cables.order_by(f"-{amp_field}", "prix_unitaire").first()
    if not chosen:
        raise ValueError("Aucun câble trouvé (aucune ampacité exploitable).")
    return chosen



# =====================================================
#  Sélection « premier modèle ≥ valeur cible »
# =====================================================
def choisir_equipement(type_eq: str, valeur_cible, attribut_logique: str):
    if not isinstance(valeur_cible, Decimal):
        valeur_cible = Decimal(str(valeur_cible))

    champ = f(type_eq, attribut_logique, attribut_logique)
    # ⬇️ exclure les None/0 pour éviter les surprises
    qs = (Equipement.objects
          .filter(categorie=type_eq)
          .exclude(**{f"{champ}__isnull": True})
          .exclude(**{f"{champ}": 0})
          .order_by(champ))
    if not qs.exists():
        raise ValueError(f"Aucun équipement de type '{type_eq}' avec champ '{champ}' exploitable.")

    for equip in qs:
        attr_value = Decimal(str(getattr(equip, champ)))
        if attr_value >= valeur_cible:
            return equip
    return qs.last()


# ===========================================================
#  Sélection « modulaires » (PV/batteries) paramétrable
#    - on respecte d'abord surdim_max si possible
#    - stratégie "cout" : coût total minimal, puis n minimal, puis valeur unitaire élevée
#    - stratégie "quantite" : n minimal, puis coût total, puis valeur unitaire élevée
#    - sinon (si aucun <= surdim_max) : surdimension minimale, puis stratégie
# ===========================================================
def choisir_modulaire(
    categorie: str,
    besoin: Decimal,
    attr_valeur_logique: str,
    attr_prix: str = "prix_unitaire",
    surdim_max: Decimal = Decimal("0.25"),
    filtre_qs: Q | None = None,
    strategie: str = "cout",   # "cout" | "quantite"
):
    attr_valeur = f(categorie, attr_valeur_logique, attr_valeur_logique)

    qs = Equipement.objects.filter(categorie=categorie)
    if filtre_qs is not None:
        qs = qs.filter(filtre_qs)
    qs = (qs
          .exclude(**{f"{attr_valeur}__isnull": True})
          .exclude(**{f"{attr_valeur}": 0})
          .exclude(**{f"{attr_prix}__isnull": True})
          .order_by(attr_valeur))

    if not qs.exists():
        raise ValueError(f"Aucun équipement de type '{categorie}' exploitable.")

    candidats_ok, candidats_relax = [], []
    for e in qs:
        val  = Decimal(str(getattr(e, attr_valeur)))
        prix = Decimal(str(getattr(e, attr_prix)))
        if prix <= 0:
            continue
        n_units  = ceil_decimal(besoin / val)
        installe = val * n_units
        surdim   = (installe - besoin) / besoin if besoin > 0 else Decimal("0")
        cout     = prix * n_units

        d = dict(equip=e, n=n_units, installe=installe, surdim=surdim, cout=cout, val=val)
        (candidats_ok if surdim <= surdim_max else candidats_relax).append(d)

    strategie = (strategie or "cout").lower()
    if strategie not in ("cout", "quantite"):
        strategie = "cout"

    if strategie == "quantite":
        key_ok    = lambda d: (d["n"], d["cout"], -d["val"])
        key_relax = lambda d: (d["surdim"], d["n"], d["cout"])
    else:  # "cout"
        key_ok    = lambda d: (d["cout"], d["n"], -d["val"])
        key_relax = lambda d: (d["surdim"], d["cout"], d["n"])

    best = sorted(candidats_ok, key=key_ok)[0] if candidats_ok else sorted(candidats_relax, key=key_relax)[0]
    return best

# ✅ alias pour compatibilité avec l'ancien nom
def choisir_modulaire_par_cout(*args, **kwargs):
    kwargs["strategie"] = "cout"
    return choisir_modulaire(*args, **kwargs)


# ===========================================================
#  Contrôles techniques simplifiés (si les champs existent)
# ===========================================================
def verifier_contraintes_simplifiees(panneau, s_pv: int, regulateur, V_batt: Decimal):
    """
    Vérifs minimales :
      - PWM : tension_nominale_module == V_batt (1 module en série par string)
      - MPPT : s_pv*Voc <= pv_voc_max_V ; s_pv*Vmp dans [mppt_v_min_V, mppt_v_max_V]
    """
    try:
        reg_type = (getattr(regulateur, f("regulateur", "type"), "") or "").upper()
        Vmp_mod  = Decimal(str(getattr(panneau,   f("panneau_solaire", "vmp"), 0)))
        Voc_mod  = Decimal(str(getattr(panneau,   f("panneau_solaire", "voc"), 0)))
        voc_max  = Decimal(str(getattr(regulateur, f("regulateur", "voc_max"), 0)))
        vmp_min  = Decimal(str(getattr(regulateur, f("regulateur", "mppt_min"), 0)))
        vmp_max  = Decimal(str(getattr(regulateur, f("regulateur", "mppt_max"), 0)))
        vnom_mod = Decimal(str(getattr(panneau,   f("panneau_solaire", "vnom"), 0)))

        s = Decimal(str(s_pv or 1))
        Voc_array = s * Voc_mod
        Vmp_array = s * Vmp_mod

        if reg_type == "PWM" and vnom_mod and V_batt:
            assert vnom_mod == V_batt, "PWM: tension nominale module ≠ tension batterie."

        if reg_type == "MPPT":
            if Voc_mod and voc_max:
                assert Voc_array <= voc_max, "MPPT: Voc array > Voc max régulateur."
            if Vmp_mod and vmp_min and vmp_max:
                assert vmp_min <= Vmp_array <= vmp_max, "MPPT: Vmp array hors plage MPPT."
    except AssertionError as e:
        raise ValueError(str(e))
    except Exception:
        # champs manquants -> on n'empêche pas le calcul
        pass


# =========================
#  Cache des recommandations
# =========================
def get_equipements_recommandes(dimensionnement):
    cache_key = f"equipements_{dimensionnement.id}"
    cached_data = cache.get(cache_key)
    if not cached_data:
        cached_data = {
            'panneau':    EquipementDetailSerializer(dimensionnement.panneau_recommande).data if dimensionnement.panneau_recommande else {},
            'batterie':   EquipementDetailSerializer(dimensionnement.batterie_recommandee).data if dimensionnement.batterie_recommandee else {},
            'regulateur': EquipementDetailSerializer(dimensionnement.regulateur_recommande).data if dimensionnement.regulateur_recommande else {},
            'onduleur':   EquipementDetailSerializer(dimensionnement.onduleur_recommande).data if dimensionnement.onduleur_recommande else {},
            'cable':      EquipementDetailSerializer(dimensionnement.cable_recommande).data if dimensionnement.cable_recommande else {},
        }
        cache.set(cache_key, cached_data, timeout=60 * 15)
    return cached_data

# =========================
#  Calcul principal
# =========================
def compute_dimensionnement(data, param):
    """
    Dimensionne le système PV.
    - data: dict avec E_jour, P_max, N_autonomie, H_solaire, V_batterie
    - param: ParametreSysteme (k_securite, n_global, dod, k_dimensionnement, s_max, i_sec)
    """
    from decimal import Decimal
    import math

    # --- Entrées utilisateur ---
    E_jour      = Decimal(str(data["E_jour"]))        # Wh/j
    P_max       = Decimal(str(data["P_max"]))         # W
    N_autonomie = Decimal(str(data["N_autonomie"]))   # jours
    H_solaire   = Decimal(str(data["H_solaire"]))     # kWh/m²/j
    V_batterie  = Decimal(str(data["V_batterie"]))    # V

    H_vers_toit = Decimal(str(data.get("H_vers_toit", 0) or 0))  # m
    priorite_selection = (data.get("priorite_selection") or "cout").lower()
    if priorite_selection not in ("cout", "quantite"):
        priorite_selection = "cout"


    # --- Paramètres système ---
    Ksec       = Decimal(str(param.k_securite))
    n_global   = Decimal(str(param.n_global))
    DoD        = Decimal(str(param.dod))
    Kdim       = Decimal(str(param.k_dimensionnement))
    SURDIM_MAX = Decimal(str(getattr(param, "s_max", 0.25)))
    SAFETY_I   = Decimal(str(getattr(param, "i_sec", 1.25)))

    # === 1) PV (besoin théorique) ===
    P_crete = (E_jour * Ksec) / (H_solaire * n_global)  # W

    choix_pv = choisir_modulaire_par_cout(
        categorie="panneau_solaire",
        besoin=P_crete,
        attr_valeur_logique="value",            # puissance_W
        attr_prix="prix_unitaire",
        surdim_max=SURDIM_MAX,
        strategie=priorite_selection,
    )
    panneau_choisi   = choix_pv["equip"]
    nombre_panneaux  = int(choix_pv["n"])              # pourra être ajusté
    P_array_installe = Decimal(str(choix_pv["installe"]))

    # === 2) Batteries (Ah au niveau parc) ===
    capacite_batt_park = (E_jour * N_autonomie) / (V_batterie * DoD)  # Ah requis au bus

    choix_batt = choisir_modulaire_par_cout(
        categorie="batterie",
        besoin=capacite_batt_park,
        attr_valeur_logique="value",            # capacite_Ah
        attr_prix="prix_unitaire",
        surdim_max=SURDIM_MAX,
        strategie=priorite_selection,
    )
    batterie_choisie = choix_batt["equip"]

    # ---- Batteries : S (série) & P (parallèle) ----
    V_unit_batt = Decimal(str(getattr(batterie_choisie, f("batterie","vnom"), 0) or 0))
    Ah_unit     = Decimal(str(getattr(batterie_choisie, f("batterie","value"), 0) or 0))  # capacite_Ah

    S_batt = 1
    if V_unit_batt and V_batterie:
        # selon catalogue, on peut assert que la division est entière
        S_batt = int(V_batterie / V_unit_batt) if (V_batterie % V_unit_batt == 0) else int(math.ceil(V_batterie / V_unit_batt))

    P_batt = int(math.ceil(capacite_batt_park / Ah_unit)) if Ah_unit else 0
    nombre_batteries = int(S_batt * P_batt)  # ✅ correction par rapport à l'ancien code

    # === 3) Onduleur ===
    puissance_totale = P_max * Kdim  # W requis onduleur
    onduleur_choisi = choisir_equipement('onduleur', puissance_totale, 'value')  # puissance_W
    if onduleur_choisi is None:
        raise ValueError("Aucun onduleur trouvé.")

    # === 4) Régulateur (courant avec marge) ===
    I_reg_req = SAFETY_I * (P_array_installe / V_batterie)  # A
    try:
        regulateur_choisi = choisir_equipement('regulateur', I_reg_req, 'value')  # -> courant_A
    except Exception:
        regulateur_choisi = choisir_equipement('regulateur', P_array_installe, 'puissance_W')

    # ---- PV : S_pv (série) & P_pv (parallèle) ----
    reg_type = (getattr(regulateur_choisi, f("regulateur", "type"), "") or "").upper()
    Vmp_mod  = Decimal(str(getattr(panneau_choisi, f("panneau_solaire","vmp"), 0) or 0))
    Voc_mod  = Decimal(str(getattr(panneau_choisi, f("panneau_solaire","voc"), 0) or 0))
    vmp_min  = Decimal(str(getattr(regulateur_choisi, f("regulateur","mppt_min"), 0) or 0))
    vmp_max  = Decimal(str(getattr(regulateur_choisi, f("regulateur","mppt_max"), 0) or 0))
    voc_max  = Decimal(str(getattr(regulateur_choisi, f("regulateur","voc_max"), 0) or 0))
    vnom_mod = Decimal(str(getattr(panneau_choisi, f("panneau_solaire","vnom"), 0) or 0))

    S_pv = 1
    if reg_type == "PWM":
        # PWM : on aligne la tension nominale module sur V_batt
        if vnom_mod and V_batterie and (V_batterie % vnom_mod == 0):
            S_pv = int(V_batterie / vnom_mod)
    else:
        # MPPT : on cherche le plus petit S_pv qui tombe dans la fenêtre MPPT et respecte Voc_max
        for s in range(1, 25):  # borne large
            Vmp_arr = Decimal(s) * Vmp_mod
            Voc_arr = Decimal(s) * Voc_mod
            ok_vmp = (vmp_min and vmp_max and Vmp_mod and (vmp_min <= Vmp_arr <= vmp_max))
            ok_voc = (voc_max and Voc_mod and (Voc_arr <= voc_max))
            if ok_vmp and ok_voc:
                S_pv = s
                break

    # Nombre de strings PV en parallèle
    P_pv = int(math.ceil(Decimal(nombre_panneaux) / Decimal(S_pv)))
    # Ajuster le nombre total de panneaux pour éviter un string incomplet
    nombre_panneaux = int(S_pv * P_pv)
    # Puissance réellement installée (si ajustée)
    P_mod = Decimal(str(getattr(panneau_choisi, f("panneau_solaire","value"), 0) or 0))
    P_array_installe = P_mod * Decimal(nombre_panneaux)

    # Vérifs avec la vraie tension de string
    verifier_contraintes_simplifiees(panneau_choisi, S_pv, regulateur_choisi, V_batterie)

    # === 5) Câble GLOBAL (un seul modèle, longueur unique) ===
    # a) Courants représentatifs (pire des cas)
    I_load_bus = (puissance_totale / V_batterie)                 # bus -> onduleur
    I_pv_bus   = SAFETY_I * (P_array_installe / V_batterie)      # MPPT -> batterie
    P_mod      = Decimal(str(getattr(panneau_choisi, f("panneau_solaire","value"), 0) or 0))
    Vmp_mod    = Decimal(str(getattr(panneau_choisi, f("panneau_solaire","vmp"), 1) or 1))
    I_string   = SAFETY_I * (P_mod / Vmp_mod) if (P_mod and Vmp_mod) else Decimal("0")

    I_req_global = max(I_load_bus, I_pv_bus, I_string)

    # b) Choix du câble global (le moins cher qui tient I_req_global)
    cable_global  = _pick_cable_for_current(I_req_global)
    prix_m_global = _prix_decimal(cable_global)  # prix au mètre

    # c) Longueur globale (fixe, sans front)
    L_global_m = H_vers_toit * Decimal("2") * Decimal("1.2")
    if L_global_m < 0:
        L_global_m = Decimal("0")
        
    # d) Prix global des câbles
    prix_cable_global = (prix_m_global * L_global_m).quantize(Decimal('1.00'))


    # === 6) Coûts & bilan ===
    bilan_energetique_annuel = E_jour * Decimal('365')

    prix_pv   = _prix_decimal(panneau_choisi)
    prix_batt = _prix_decimal(batterie_choisie)
    prix_reg  = _prix_decimal(regulateur_choisi)
    prix_ondu = _prix_decimal(onduleur_choisi)
    
    cout_total = (
        nombre_panneaux * prix_pv +
        nombre_batteries * prix_batt +
        prix_reg + prix_ondu +
        prix_cable_global
    )


    # === 7) Résultat ===
    return {
        "puissance_totale": float(puissance_totale.quantize(Decimal('1.0'))),   # W
        "capacite_batterie": float(capacite_batt_park.quantize(Decimal('1.0'))),# Ah (niveau parc)
        "nombre_panneaux": int(nombre_panneaux),
        "nombre_batteries": int(nombre_batteries),
        "bilan_energetique_annuel": float(bilan_energetique_annuel),            # Wh/an
        "cout_total": float(cout_total.quantize(Decimal('1.00'))),

        # Topologies conseillées (NOUVEAU)
        "nb_batt_serie": int(S_batt),
        "nb_batt_parallele": int(P_batt),
        "topologie_batterie": f"{int(S_batt)}S{int(P_batt)}P",
        "nb_pv_serie": int(S_pv),
        "nb_pv_parallele": int(P_pv),
        "topologie_pv": f"{int(S_pv)}S{int(P_pv)}P",

        # Objets recommandés (inchangé)
        "panneau_recommande": panneau_choisi,
        "batterie_recommandee": batterie_choisie,
        "regulateur_recommande": regulateur_choisi,
        "onduleur_recommande": onduleur_choisi,
        "longueur_cable_global_m": float(L_global_m),
        "prix_cable_global": float(prix_cable_global),
        "cable_global": EquipementDetailSerializer(cable_global).data,

        "cable_recommande": cable_global,
    }

