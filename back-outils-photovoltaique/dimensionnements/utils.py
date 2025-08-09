import math
from decimal import Decimal
from equipements.models import Equipement
from dimensionnements.serializers import EquipementDetailSerializer
from django.core.cache import cache

def get_equipements_recommandes(dimensionnement):
    """
    Récupère les équipements recommandés d’un dimensionnement donné,
    en utilisant le cache pour éviter de recalculer à chaque fois.
    """
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


def choisir_equipement(type_eq, valeur_cible, attribut_comparaison):
    """
    Sélectionne un équipement dont l'attribut est >= à la valeur cible.
    Si aucun, retourne le plus puissant/disponible.
    """
    print(f"🔍 DEBUG: Recherche categorie='{type_eq}', valeur_cible={valeur_cible}, attribut='{attribut_comparaison}'")
    
    if not isinstance(valeur_cible, Decimal):
        valeur_cible = Decimal(str(valeur_cible))

    candidats = Equipement.objects.filter(categorie=type_eq).order_by(attribut_comparaison)
    print(f"📊 DEBUG: Trouvé {candidats.count()} candidats")
    
    if candidats.exists():
        for c in candidats:
            print(f"   - {c.nom}: {attribut_comparaison}={getattr(c, attribut_comparaison)}")
    
    if not candidats.exists():
        print(f"❌ DEBUG: Aucun équipement trouvé pour categorie='{type_eq}'")
        raise ValueError(f"Aucun équipement de type '{type_eq}' trouvé dans la base de données.")

    for equip in candidats:
        attr_value = getattr(equip, attribut_comparaison)
        if not isinstance(attr_value, Decimal):
            attr_value = Decimal(str(attr_value))

        if attr_value >= valeur_cible:
            print(f"✅ DEBUG: Sélectionné {equip.nom}")
            return equip

    selected = candidats.last()
    print(f"⚠️ DEBUG: Aucun >= {valeur_cible}, pris le dernier: {selected.nom if selected else 'None'}")
    return selected


def compute_dimensionnement(data, param):
    """
    Calcule le dimensionnement d'un système photovoltaïque à partir des données d'entrée.
    """
    # Données utilisateur
    E_jour      = Decimal(str(data["E_jour"]))        # Wh/j
    P_max       = Decimal(str(data["P_max"]))         # W
    N_autonomie = Decimal(str(data["N_autonomie"]))   # jours
    H_solaire   = Decimal(str(data["H_solaire"]))     # kWh/m²/j
    V_batterie  = Decimal(str(data["V_batterie"]))    # V

    # Paramètres système
    Ksec       = Decimal(str(param.k_securite))       # Coef sécurité
    n_global   = Decimal(str(param.n_global))         # Rendement global
    DoD        = Decimal(str(param.dod))              # Profondeur de décharge
    Kdim       = Decimal(str(param.k_dimensionnement))# Coef dimensionnement onduleur

    # 1) Générateur PV
    P_crête = (E_jour * Ksec) / (H_solaire * n_global)
    panneau_choisi = choisir_equipement('panneau_solaire', P_crête, 'puissance')
    if panneau_choisi is None:
        raise ValueError("Aucun panneau solaire trouvé.")
    nombre_panneaux = math.ceil(P_crête / panneau_choisi.puissance)

    # 2) Capacité batterie
    capacite_batt = (E_jour * N_autonomie) / (V_batterie * DoD)  # ❌ Enlever *1000 ici !
    batterie_choisie = choisir_equipement('batterie', capacite_batt, 'capacite')
    if batterie_choisie is None:
        raise ValueError("Aucune batterie trouvée.")
    nombre_batteries = math.ceil(capacite_batt / batterie_choisie.capacite)

    # 3) Onduleur
    puissance_totale = P_max * Kdim
    onduleur_choisi = choisir_equipement('onduleur', puissance_totale, 'puissance')
    if onduleur_choisi is None:
        raise ValueError("Aucun onduleur trouvé.")

    # 4) Régulateur
    courant_regulateur = (P_crête * Decimal('1000')) / V_batterie  # ✅ GARDER cette ligne
    regulateur_choisi = choisir_equipement('regulateur', P_crête, 'puissance')  # ✅ CHANGER juste le critère
    if regulateur_choisi is None:
        raise ValueError("Aucun régulateur trouvé.")

    # 5) Câble
    courant_cable = puissance_totale * Decimal('1000') / V_batterie  # ✅ GARDER cette ligne aussi
    cable_choisi = choisir_equipement('cable', Decimal('1'), 'prix_unitaire')  # ✅ CHANGER juste le critère
    if cable_choisi is None:
        raise ValueError("Aucun câble trouvé.")

    # 5) Résumé
    bilan_energetique_annuel = E_jour * Decimal('365')
    cout_total = (
        nombre_panneaux * panneau_choisi.prix_unitaire +
        nombre_batteries * batterie_choisie.prix_unitaire +
        regulateur_choisi.prix_unitaire +
        onduleur_choisi.prix_unitaire +
        cable_choisi.prix_unitaire
    )

    # 6) Résultats
    return {
        "P_crête": float(round(P_crête, 1)),
        "nombre_panneaux": int(nombre_panneaux),
        "capacite_batterie": float(round(capacite_batt, 1)),
        "nombre_batteries": int(nombre_batteries),
        "puissance_totale": float(round(puissance_totale, 1)),
        "courant_regulateur": float(round(courant_regulateur, 1)),
        "bilan_energetique_annuel": float(bilan_energetique_annuel),
        "cout_total": float(round(cout_total, 2)),

        "panneau_recommande": panneau_choisi,
        "batterie_recommandee": batterie_choisie,
        "regulateur_recommande": regulateur_choisi,
        "onduleur_recommande": onduleur_choisi,
        "cable_recommande": cable_choisi,
    }
