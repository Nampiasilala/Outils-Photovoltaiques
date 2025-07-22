import math
from decimal import Decimal # Importation nécessaire pour les calculs précis
from equipements.models import Equipement
# Assurez-vous d'importer DonneesEntree et ParametreSysteme si ces modèles sont utilisés ailleurs
# (bien que pour ce fichier, ils ne soient pas directement utilisés, mais ils sont passés en paramètre)
# from donnees_entree.models import DonneesEntree
# from parametres.models import ParametreSysteme

def choisir_equipement(type_eq, valeur_cible, attribut_comparaison):
    """
    Choisit un équipement du type donné dont l'attribut de comparaison
    est supérieur ou égal à la valeur cible.
    Si aucun n'est trouvé, retourne le plus grand disponible.
    Lève une ValueError si aucun équipement du type n'est trouvé du tout.
    """
    # Convertir la valeur_cible en Decimal pour une comparaison cohérente,
    # car les attributs des équipements sont probablement des DecimalFields.
    if not isinstance(valeur_cible, Decimal):
        valeur_cible = Decimal(str(valeur_cible))

    candidats = Equipement.objects.filter(type_equipement=type_eq).order_by(attribut_comparaison)
    
    # Vérifier si 'candidats' est vide avant de tenter d'accéder à ses éléments
    if not candidats.exists():
        raise ValueError(f"Aucun équipement de type '{type_eq}' trouvé dans la base de données. Veuillez en ajouter.")

    for equip in candidats:
        # Assurez-vous que l'attribut est également un Decimal pour la comparaison
        attr_value = getattr(equip, attribut_comparaison)
        if not isinstance(attr_value, Decimal):
            attr_value = Decimal(str(attr_value))

        if attr_value >= valeur_cible:
            return equip
            
    # Si aucun équipement n'est supérieur ou égal, retourne le plus grand disponible
    # (cela ne devrait être atteint que si tous les candidats sont inférieurs à valeur_cible)
    return candidats.last()

def compute_dimensionnement(data, param):
    """
    Calcule le dimensionnement d'un système solaire photovoltaïque.
    Toutes les opérations numériques sont effectuées avec le type Decimal pour la précision.
    Retourne les résultats numériques et les OBJETS Equipement choisis.
    """
    # --- Données utilisateur (converties en Decimal dès l'entrée) ---
    E_jour      = Decimal(str(data["E_jour"]))        # Wh/jour
    P_max       = Decimal(str(data["P_max"]))         # W
    N_autonomie = Decimal(str(data["N_autonomie"]))   # jours
    H_solaire   = Decimal(str(data["H_solaire"]))     # kWh/m²/jour
    V_batterie  = Decimal(str(data["V_batterie"]))    # V

    # --- Paramètres système (convertis en Decimal si ce ne sont pas déjà des DecimalFields) ---
    # Il est recommandé que les champs k_securite, n_global, dod, k_dimensionnement
    # dans votre modèle ParametreSysteme soient des DecimalField pour une meilleure pratique.
    # Si ce sont des float, la conversion Decimal(str(...)) est nécessaire.
    Ksec       = Decimal(str(param.k_securite))
    n_global   = Decimal(str(param.n_global))
    DoD        = Decimal(str(param.dod))
    Kdim       = Decimal(str(param.k_dimensionnement))

    # --- 1) Dimensionnement du Générateur PV ---
    # Tous les opérandes sont des Decimals, la division est donc sûre et précise.
    P_crête         = (E_jour * Ksec) / (H_solaire * n_global)
    
    # Choisir le panneau solaire approprié
    panneau_choisi   = choisir_equipement('Panneau solaire', P_crête, 'puissance')
    
    # Vérification cruciale : si aucun panneau n'a été trouvé par choisir_equipement
    if panneau_choisi is None:
        raise ValueError("Impossible de trouver un panneau solaire approprié. Vérifiez vos équipements en base de données.")
    
    # panneau_choisi.puissance est un DecimalField, donc la division est sûre.
    nombre_panneaux  = math.ceil(P_crête / panneau_choisi.puissance)

    # --- 2) Dimensionnement du Parc Batterie (Ah) ---
    # Tous les opérandes sont des Decimals. Utilisation de Decimal('1000') pour la constante.
    capacite_batt    = (E_jour * N_autonomie * Decimal('1000')) / (V_batterie * DoD)
    
    # Choisir la batterie appropriée
    batterie_choisie = choisir_equipement('Batterie', capacite_batt, 'capacite')
    
    # Vérification cruciale : si aucune batterie n'a été trouvée
    if batterie_choisie is None:
        raise ValueError("Impossible de trouver une batterie appropriée. Vérifiez vos équipements en base de données.")

    nombre_batteries = math.ceil(capacite_batt / batterie_choisie.capacite)

    # --- 3) Dimensionnement de l'Onduleur ---
    # Tous les opérandes sont des Decimals.
    puissance_totale = P_max * Kdim

    # --- 4) Dimensionnement du Régulateur ---
    # Tous les opérandes sont des Decimals. Utilisation de Decimal('1000') pour la constante.
    courant_regulateur = (P_crête * Decimal('1000')) / V_batterie
    
    # Choisir le régulateur approprié
    regulateur_choisi  = choisir_equipement('Régulateur', courant_regulateur, 'tension')
    
    # Vérification cruciale : si aucun régulateur n'a été trouvé
    if regulateur_choisi is None:
        raise ValueError("Impossible de trouver un régulateur approprié. Vérifiez vos équipements en base de données.")

    # --- 5) Bilan Énergétique Annuel & Coût Total ---
    # E_jour est un Decimal, donc le résultat est un Decimal.
    bilan_energetique_annuel = E_jour * Decimal('365')
    
    # Tous les prix unitaires et nombres sont des Decimals ou des entiers
    cout_total = (
        nombre_panneaux  * panneau_choisi.prix_unitaire +
        nombre_batteries * batterie_choisie.prix_unitaire +
        regulateur_choisi.prix_unitaire
    )

    # --- Retour des résultats (conversion en float pour la sérialisation JSON) ---
    # Retourne les objets Equipement choisis directement pour être sauvegardés dans les ForeignKeys
    return {
        # Convertir les Decimal en float pour la sortie JSON. Appliquer round() avant float().
        "P_crête": float(round(P_crête, 1)),
        "nombre_panneaux": int(nombre_panneaux), # math.ceil retourne un float, convertir en int
        "capacite_batterie": float(round(capacite_batt, 1)),
        "nombre_batteries": int(nombre_batteries), # math.ceil retourne un float, convertir en int
        "puissance_totale": float(round(puissance_totale, 1)),
        "courant_regulateur": float(round(courant_regulateur, 1)),
        "bilan_energetique_annuel": float(bilan_energetique_annuel),
        "cout_total": float(round(cout_total, 2)),
        
        # Retourne les objets Equipement eux-mêmes (non sérialisés ici)
        # Ces clés doivent correspondre aux noms de vos champs ForeignKey dans le modèle Dimensionnement
        "panneau_recommande": panneau_choisi,
        "batterie_recommandee": batterie_choisie,
        "regulateur_recommande": regulateur_choisi,
    }
