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
#  Sélection « modulaires » (PV/batteries) optimisée
#    - surdimensionnement <= surdim_max si possible
#    - coût total minimal (prix_unitaire × quantité)
#    - sinon: surdimensionnement minimal puis coût
# ===========================================================
def choisir_modulaire_par_cout(
    categorie: str,
    besoin: Decimal,
    attr_valeur_logique: str,
    attr_prix: str = "prix_unitaire",
    surdim_max: Decimal = Decimal("0.25"),
    filtre_qs: Q | None = None,
):
    attr_valeur = f(categorie, attr_valeur_logique, attr_valeur_logique)

    qs = Equipement.objects.filter(categorie=categorie)
    if filtre_qs is not None:
        qs = qs.filter(filtre_qs)
    qs = (qs.exclude(**{f"{attr_valeur}__isnull": True})
            .exclude(**{f"{attr_valeur}": 0})
            .exclude(**{f"{attr_prix}__isnull": True})
            .order_by(attr_valeur))

    if not qs.exists():
        raise ValueError(f"Aucun équipement de type '{categorie}' exploitable.")

    candidats_ok, candidats_relax = [], []
    for e in qs:
        val = Decimal(str(getattr(e, attr_valeur)))
        prix = Decimal(str(getattr(e, attr_prix)))
        if prix <= 0:
            continue
        n_units = ceil_decimal(besoin / val)
        installe = val * n_units
        surdim = (installe - besoin) / besoin if besoin > 0 else Decimal("0")
        total_cost = prix * n_units

        d = dict(equip=e, n=n_units, installe=installe, surdim=surdim, cout=total_cost, val=val)
        (candidats_ok if surdim <= surdim_max else candidats_relax).append(d)

    def key_ok(d):    return (d["cout"], d["n"], -d["val"])
    def key_relax(d): return (d["surdim"], d["cout"], d["n"])

    best = sorted(candidats_ok, key=key_ok)[0] if candidats_ok else sorted(candidats_relax, key=key_relax)[0]
    return best

# ===========================================================
#  Contrôles techniques simplifiés (si les champs existent)
# ===========================================================
def verifier_contraintes_simplifiees(panneau, n_panneaux, regulateur, V_batt: Decimal):
    """
    Vérifications minimales et silencieuses si champ manquant:
      - PWM: tension_nominale_module == V_batt
      - MPPT: Voc_array <= pv_voc_max_V ; Vmp_array dans [mppt_v_min_V, mppt_v_max_V]
    """
    try:
        reg_type = (getattr(regulateur, f("regulateur", "type"), "") or "").upper()
        Vmp_mod  = Decimal(str(getattr(panneau,   f("panneau_solaire", "vmp"), 0)))
        Voc_mod  = Decimal(str(getattr(panneau,   f("panneau_solaire", "voc"), 0)))
        voc_max  = Decimal(str(getattr(regulateur, f("regulateur", "voc_max"), 0)))
        vmp_min  = Decimal(str(getattr(regulateur, f("regulateur", "mppt_min"), 0)))
        vmp_max  = Decimal(str(getattr(regulateur, f("regulateur", "mppt_max"), 0)))
        vnom_mod = Decimal(str(getattr(panneau,   f("panneau_solaire", "vnom"), 0)))

        # Hypothèse: PV en parallèle -> tension d'un module
        Voc_array = Voc_mod
        Vmp_array = Vmp_mod

        if reg_type == "PWM" and vnom_mod and V_batt:
            assert vnom_mod == V_batt, "PWM: tension nominale module ≠ tension batterie."

        if reg_type == "MPPT" and Voc_mod and voc_max:
            assert Voc_array <= voc_max, "MPPT: Voc array > Voc max régulateur."
        if reg_type == "MPPT" and Vmp_mod and vmp_min and vmp_max:
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
    - param: instance ParametreSysteme (singleton) avec k_securite, n_global, dod, k_dimensionnement, s_max, i_sec
    Retourne des clés compatibles avec la vue & le modèle.
    """
    # --- Entrées utilisateur ---
    E_jour      = Decimal(str(data["E_jour"]))        # Wh/j
    P_max       = Decimal(str(data["P_max"]))         # W
    N_autonomie = Decimal(str(data["N_autonomie"]))   # jours
    H_solaire   = Decimal(str(data["H_solaire"]))     # kWh/m²/j
    V_batterie  = Decimal(str(data["V_batterie"]))    # V

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
        attr_valeur_logique="value",            # -> puissance_W
        attr_prix="prix_unitaire",
        surdim_max=SURDIM_MAX,
    )
    panneau_choisi   = choix_pv["equip"]
    nombre_panneaux  = choix_pv["n"]
    P_array_installe = choix_pv["installe"]            # W

    # === 2) Batteries (Ah) ===
    capacite_batt = (E_jour * N_autonomie) / (V_batterie * DoD)  # Ah

    choix_batt = choisir_modulaire_par_cout(
        categorie="batterie",
        besoin=capacite_batt,
        attr_valeur_logique="value",            # -> capacite_Ah
        attr_prix="prix_unitaire",
        surdim_max=SURDIM_MAX,
    )
    batterie_choisie = choix_batt["equip"]
    nombre_batteries = choix_batt["n"]

    # === 3) Onduleur ===
    puissance_totale = P_max * Kdim  # W requis onduleur
    onduleur_choisi = choisir_equipement('onduleur', puissance_totale, 'value')  # -> puissance_W
    if onduleur_choisi is None:
        raise ValueError("Aucun onduleur trouvé.")

    # === 4) Régulateur (courant avec marge) ===
    I_reg_req = SAFETY_I * (P_array_installe / V_batterie)  # A
    try:
        regulateur_choisi = choisir_equipement('regulateur', I_reg_req, 'value')  # -> courant_A
    except Exception:
        # Fallback (rare) si comparaison par courant impossible
        regulateur_choisi = choisir_equipement('regulateur', P_array_installe, 'puissance_W')

    # Vérifications simplifiées (optionnelles)
    verifier_contraintes_simplifiees(panneau_choisi, nombre_panneaux, regulateur_choisi, V_batterie)

    # === 5) Câble DC ===
    I_dc_req = puissance_totale / V_batterie  # A
    cables = Equipement.objects.filter(categorie__iexact='cable')  # insensible à la casse
    amp_field = f("cable", "ampacity")  # -> 'ampacite_A' via FIELD_MAP

    # Nettoyage: exclure ampacité NULL ou 0
    cables = (cables
            .exclude(**{f"{amp_field}__isnull": True})
            .exclude(**{amp_field: 0}))

    # 1) Essayer de prendre un câble qui couvre l'intensité requise (prix le plus bas)
    cables_ok = (cables
                .filter(**{f"{amp_field}__gte": I_dc_req})
                .order_by('prix_unitaire'))

    cable_choisi = cables_ok.first()
    cable_surclasse = False

    # 2) Sinon, prendre le plus puissant (et à puissance égale, le moins cher)
    if cable_choisi is None:
        # ordre: ampacité décroissante, puis prix croissant
        cable_choisi = cables.order_by(f"-{amp_field}", "prix_unitaire").first()
        cable_surclasse = True  # indicateur utile pour tracer/afficher

    if cable_choisi is None:
        raise ValueError("Aucun câble trouvé (aucune ampacité exploitable).")

    # === 6) Coûts & bilan ===
    bilan_energetique_annuel = E_jour * Decimal('365')
# ...
    prix_pv   = _prix_decimal(panneau_choisi)
    prix_batt = _prix_decimal(batterie_choisie)
    prix_reg  = _prix_decimal(regulateur_choisi)
    prix_ondu = _prix_decimal(onduleur_choisi)
    prix_cabl = _prix_decimal(cable_choisi)

    cout_total = (
        nombre_panneaux * prix_pv +
        nombre_batteries * prix_batt +
        prix_reg + prix_ondu + prix_cabl
    )


    # === 7) Résultat (clés attendues par la vue) ===
    return {
        "puissance_totale": float(puissance_totale.quantize(Decimal('1.0'))),   # W
        "capacite_batterie": float(capacite_batt.quantize(Decimal('1.0'))),     # Ah
        "nombre_panneaux": int(nombre_panneaux),
        "nombre_batteries": int(nombre_batteries),
        "bilan_energetique_annuel": float(bilan_energetique_annuel),            # Wh/an
        "cout_total": float(cout_total.quantize(Decimal('1.00'))),

        # Objets recommandés
        "panneau_recommande": panneau_choisi,
        "batterie_recommandee": batterie_choisie,
        "regulateur_recommande": regulateur_choisi,
        "onduleur_recommande": onduleur_choisi,
        "cable_recommande": cable_choisi,
    }
