import math
from decimal import Decimal, ROUND_UP
from equipements.models import Equipement
from dimensionnements.serializers import EquipementDetailSerializer
from django.core.cache import cache
from django.db.models import Q

# =========================
#  Paramètres / constantes
# =========================
SURDIM_MAX = Decimal('0.25')  # 25% de surdimensionnement autorisé (PV et batteries)
SAFETY_I   = Decimal('1.25')  # marge courant régulateur (NEC/conditions froides)

def ceil_decimal(x: Decimal) -> int:
    """Arrondi supérieur pour Decimal -> int."""
    return int(x.to_integral_value(rounding=ROUND_UP))

# =====================================================
#  Sélection générique « premier modèle ≥ valeur cible »
# =====================================================
def choisir_equipement(type_eq, valeur_cible, attribut_comparaison):
    """
    Sélectionne un équipement dont l'attribut est >= à la valeur cible.
    Si aucun, retourne le plus puissant/disponible.
    """
    if not isinstance(valeur_cible, Decimal):
        valeur_cible = Decimal(str(valeur_cible))

    candidats = Equipement.objects.filter(categorie=type_eq).order_by(attribut_comparaison)
    if not candidats.exists():
        raise ValueError(f"Aucun équipement de type '{type_eq}' trouvé dans la base de données.")

    for equip in candidats:
        attr_value = getattr(equip, attribut_comparaison)
        attr_value = Decimal(str(attr_value))
        if attr_value >= valeur_cible:
            return equip

    return candidats.last()

# ===========================================================
#  Sélection « modulaires » (panneaux/batteries) optimisée
#    - surdimensionnement <= SURDIM_MAX si possible
#    - coût total minimal (prix_unitaire × quantité)
#    - à défaut: surdimensionnement minimal puis coût
# ===========================================================
def choisir_modulaire_par_cout(
    categorie: str,
    besoin: Decimal,
    attr_valeur: str,       # "puissance" (W) pour panneaux, "capacite" (Ah) pour batteries
    attr_prix: str = "prix_unitaire",
    surdim_max: Decimal = SURDIM_MAX,
    filtre_qs: Q | None = None,
):
    qs = Equipement.objects.filter(categorie=categorie)
    if filtre_qs is not None:
        qs = qs.filter(filtre_qs)
    qs = qs.order_by(attr_valeur)

    if not qs.exists():
        raise ValueError(f"Aucun équipement de type '{categorie}' trouvé.")

    candidats_ok = []
    candidats_relax = []

    for e in qs:
        val = Decimal(str(getattr(e, attr_valeur, 0)))
        if val <= 0:
            continue
        prix = Decimal(str(getattr(e, attr_prix, 0)))
        n_units = ceil_decimal(besoin / val)
        installe = val * n_units
        surdim = (installe - besoin) / besoin  # >= 0 grâce au ceil
        total_cost = prix * n_units

        data = dict(
            equip=e, n=n_units, installe=installe, surdim=surdim, cout=total_cost, val=val
        )
        if surdim <= surdim_max:
            candidats_ok.append(data)
        else:
            candidats_relax.append(data)

    def key_ok(d):     # coût minimal, puis moins d’unités, puis plus grande valeur unitaire (moins de connexions)
        return (d["cout"], d["n"], -d["val"])

    def key_relax(d):  # surdimensionnement minimal, puis coût, puis moins d’unités
        return (d["surdim"], d["cout"], d["n"])

    if candidats_ok:
        best = sorted(candidats_ok, key=key_ok)[0]
    else:
        # Aucun module ne respecte SURDIM_MAX -> on minimise le surdimensionnement
        best = sorted(candidats_relax, key=key_relax)[0]

    return best  # dict: equip, n, installe, surdim, cout, val

# ===========================================================
#  Contrôles techniques simplifiés (si les champs existent)
# ===========================================================
def verifier_contraintes_simplifiees(panneau, n_panneaux, regulateur, V_batt: Decimal):
    """
    Vérif minimale:
      - Si regulateur.type == 'PWM' -> tension_nominale_panneau doit correspondre à V_batt.
      - Si MPPT et champs présents : Voc_array <= regulateur.voc_max_pv ; Vmp_array dans plage MPPT.
    Tous ces contrôles sont optionnels (ne bloquent pas si champs manquent).
    """
    try:
        reg_type = getattr(regulateur, "type", "").upper()  # 'MPPT' ou 'PWM'
        Vmp_mod  = Decimal(str(getattr(panneau, "vmp", 0)))     # V à Pmpp (si présent)
        Voc_mod  = Decimal(str(getattr(panneau, "voc", 0)))     # V à vide (si présent)
        voc_max  = Decimal(str(getattr(regulateur, "pv_voc_max", 0)))
        vmp_min  = Decimal(str(getattr(regulateur, "mppt_v_min", 0)))
        vmp_max  = Decimal(str(getattr(regulateur, "mppt_v_max", 0)))
        tension_nominale_module = Decimal(str(getattr(panneau, "tension_nominale", 0)))  # 12/24 V

        # On suppose un câblage en parallèle (tension = tension d’un module)
        Voc_array = Voc_mod
        Vmp_array = Vmp_mod

        if reg_type == "PWM" and tension_nominale_module and V_batt:
            assert tension_nominale_module == V_batt, \
                "PWM: tension nominale module doit correspondre à la tension batterie."

        if reg_type == "MPPT" and Voc_mod and voc_max:
            assert Voc_array <= voc_max, "MPPT: Voc array > Voc max régulateur (hors spec)."
        if reg_type == "MPPT" and Vmp_mod and vmp_min and vmp_max:
            assert vmp_min <= Vmp_array <= vmp_max, "MPPT: Vmp array hors plage MPPT."

    except AssertionError as e:
        # On lève une erreur explicite pour capturer en amont
        raise ValueError(str(e))
    except Exception:
        # Silencieux si les champs n’existent pas : on ne bloque pas
        pass

# =========================
#  Cache des recommandations
# =========================
def get_equipements_recommandes(dimensionnement):
    cache_key = f"equipements_{dimensionnement.id}"
    cached_data = cache.get(cache_key)

    if not cached_data:
        cached_data = {
            'panneau': EquipementDetailSerializer(dimensionnement.panneau_recommande).data if dimensionnement.panneau_recommande else {},
            'batterie': EquipementDetailSerializer(dimensionnement.batterie_recommandee).data if dimensionnement.batterie_recommandee else {},
            'regulateur': EquipementDetailSerializer(dimensionnement.regulateur_recommande).data if dimensionnement.regulateur_recommande else {},
            'onduleur': EquipementDetailSerializer(dimensionnement.onduleur_recommande).data if dimensionnement.onduleur_recommande else {},
            'cable': EquipementDetailSerializer(dimensionnement.cable_recommande).data if dimensionnement.cable_recommande else {},
        }
        cache.set(cache_key, cached_data, timeout=60 * 15)  # 15 minutes

    return cached_data

# =========================
#  Calcul principal
# =========================
def compute_dimensionnement(data, param):
    # Données utilisateur
    E_jour      = Decimal(str(data["E_jour"]))        # Wh/j
    P_max       = Decimal(str(data["P_max"]))         # W
    N_autonomie = Decimal(str(data["N_autonomie"]))   # jours
    H_solaire   = Decimal(str(data["H_solaire"]))     # kWh/m²/j (≈ h/j de PSH)
    V_batterie  = Decimal(str(data["V_batterie"]))    # V

    # Paramètres système
    Ksec       = Decimal(str(param.k_securite))
    n_global   = Decimal(str(param.n_global))
    DoD        = Decimal(str(param.dod))
    Kdim       = Decimal(str(param.k_dimensionnement))

    # 1) Générateur PV (besoin théorique)
    P_crete = (E_jour * Ksec) / (H_solaire * n_global)  # W (utilise PSH)

    # -- Sélection modulaire panneaux: coût min sous contrainte SURDIM_MAX
    choix_pv = choisir_modulaire_par_cout(
        categorie="panneau_solaire",
        besoin=P_crete,
        attr_valeur="puissance",        # W par module
        attr_prix="prix_unitaire",
        surdim_max=SURDIM_MAX,
    )
    panneau_choisi   = choix_pv["equip"]
    nombre_panneaux  = choix_pv["n"]
    P_array_installe = choix_pv["installe"]            # W
    surdim_pv        = choix_pv["surdim"]

    # 2) Capacité batterie (besoin Ah)
    capacite_batt = (E_jour * N_autonomie) / (V_batterie * DoD)  # Ah

    # -- Sélection modulaire batteries: coût min sous contrainte SURDIM_MAX
    choix_batt = choisir_modulaire_par_cout(
        categorie="batterie",
        besoin=capacite_batt,
        attr_valeur="capacite",         # Ah par monobloc
        attr_prix="prix_unitaire",
        surdim_max=SURDIM_MAX,
    )
    batterie_choisie = choix_batt["equip"]
    nombre_batteries = choix_batt["n"]
    C_installee_Ah   = choix_batt["installe"]
    surdim_batt      = choix_batt["surdim"]

    # 3) Onduleur (gamme large)
    puissance_totale = P_max * Kdim  # W
    onduleur_choisi = choisir_equipement('onduleur', puissance_totale, 'puissance')
    if onduleur_choisi is None:
        raise ValueError("Aucun onduleur trouvé.")

    # 4) Régulateur (par courant, avec marge de sécurité)
    I_reg_req = SAFETY_I * (P_array_installe / V_batterie)  # A
    # si vos régulateurs ont 'courant' (A) :
    try:
        regulateur_choisi = choisir_equipement('regulateur', I_reg_req, 'courant')
    except Exception:
        # fallback si la DB n'a pas encore le champ 'courant'
        regulateur_choisi = choisir_equipement('regulateur', P_array_installe, 'puissance')

    # 4bis) Vérification simplifiée de compatibilité PV/régulateur/batterie
    verifier_contraintes_simplifiees(panneau_choisi, nombre_panneaux, regulateur_choisi, V_batterie)

    # 5) Câble côté DC (sélection par ampacité)
    I_dc_req = puissance_totale / V_batterie  # A (courant max côté batterie/onduleur)
    cable_choisi = None
    # si la base a un champ 'ampacite', on l'utilise
    cables = Equipement.objects.filter(categorie='cable')
    if cables.filter(ampacite__isnull=False).exists():
        cables_ok = cables.filter(ampacite__gte=I_dc_req).order_by('prix_unitaire')
        cable_choisi = cables_ok.first()
    else:
        # fallback temporaire : choisir le câble le moins cher (à remplacer dès ajout 'ampacite')
        cable_choisi = cables.order_by('prix_unitaire').first()

    if cable_choisi is None:
        raise ValueError("Aucun câble trouvé.")

    # 6) Coûts et bilan
    bilan_energetique_annuel = E_jour * Decimal('365')
    cout_total = (
        nombre_panneaux * Decimal(str(panneau_choisi.prix_unitaire)) +
        nombre_batteries * Decimal(str(batterie_choisie.prix_unitaire)) +
        Decimal(str(regulateur_choisi.prix_unitaire)) +
        Decimal(str(onduleur_choisi.prix_unitaire)) +
        Decimal(str(cable_choisi.prix_unitaire))
    )

    # 7) Résultats
    return {
        "P_crête": float(P_crete.quantize(Decimal('1.0'))),
        "pv_installe_W": float(P_array_installe),
        "surdim_pv": float((surdim_pv * 100).quantize(Decimal('1.0'))),  # %
        "nombre_panneaux": int(nombre_panneaux),

        "capacite_batterie_Ah": float(capacite_batt.quantize(Decimal('1.0'))),
        "capacite_installee_Ah": float(C_installee_Ah),
        "surdim_batterie": float((surdim_batt * 100).quantize(Decimal('1.0'))),  # %
        "nombre_batteries": int(nombre_batteries),

        "puissance_onduleur_requise_W": float(puissance_totale.quantize(Decimal('1.0'))),

        "courant_regulateur_requis_A": float(I_reg_req.quantize(Decimal('1.0'))),

        "bilan_energetique_annuel_Wh": float(bilan_energetique_annuel),

        "cout_total": float(cout_total.quantize(Decimal('1.00'))),

        "panneau_recommande": panneau_choisi,
        "batterie_recommandee": batterie_choisie,
        "regulateur_recommande": regulateur_choisi,
        "onduleur_recommande": onduleur_choisi,
        "cable_recommande": cable_choisi,
    }
