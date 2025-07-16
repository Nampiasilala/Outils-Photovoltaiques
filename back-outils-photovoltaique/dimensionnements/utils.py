import math

def compute_dimensionnement(data, param, equipements):
    # Données utilisateur
    E_jour      = data["E_jour"]        # Wh/jour
    P_max       = data["P_max"]         # W
    N_autonomie = data["N_autonomie"]   # jours
    H_solaire   = data["H_solaire"]     # kWh/m²/jour
    V_batterie  = data["V_batterie"]    # V

    # Paramètres système
    Ksec       = param.k_securite
    n_global   = param.n_global
    DoD        = param.dod
    Kdim       = param.k_dimensionnement

    # Équipements choisis
    panneau  = equipements["panneau"]
    batterie = equipements["batterie"]

    # 1) Générateur PV
    P_crête         = (E_jour * Ksec) / (H_solaire * n_global)
    nombre_panneaux  = math.ceil(P_crête / panneau.puissance)

    # 2) Parc Batterie (Ah)
    capacite_batt    = (E_jour * N_autonomie * 1e3) / (V_batterie * DoD)
    nombre_batteries = math.ceil(capacite_batt / batterie.capacite)

    # 3) Onduleur
    puissance_totale = P_max * Kdim

    # 4) Régulateur
    courant_regulateur = (P_crête * 1e3) / V_batterie

    # 5) Bilan & coût
    bilan_energetique_annuel = E_jour * 365
    cout_total = (
        nombre_panneaux  * panneau.prix_unitaire +
        nombre_batteries * batterie.prix_unitaire
    )

    return {
        "P_crête"                  : round(P_crête, 1),
        "nombre_panneaux"           : nombre_panneaux,
        "capacite_batterie"         : round(capacite_batt, 1),
        "nombre_batteries"          : nombre_batteries,
        "puissance_totale"          : round(puissance_totale, 1),
        "courant_regulateur"        : round(courant_regulateur, 1),
        "bilan_energetique_annuel"  : bilan_energetique_annuel,
        "cout_total"                : round(cout_total, 2),
    }
