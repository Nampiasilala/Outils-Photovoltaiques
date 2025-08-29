// types/api.ts
export type PrioriteSelection = 'cout' | 'quantite';
export const DEFAULT_PRIORITE_SELECTION: PrioriteSelection = 'cout';

export interface CalculationInput {
  E_jour: number;          // Consommation journalière en Wh
  P_max: number;           // Puissance maximale en W
  N_autonomie: number;     // Nombre de jours d'autonomie
  H_solaire: number;       // Irradiation solaire en kWh/m²/j
  V_batterie: number;      // Tension de la batterie en V (12, 24, ou 48)
  localisation: string;    // Localisation géographique
  H_vers_toit: number;                   // nouveau (requis côté backend)
  priorite_selection?: PrioriteSelection; 
}

export interface Equipment {
  modele: string;
  reference?: string;
  puissance_W?: number;
  capacite_Ah?: number;
  tension_nominale_V?: number;
  prix_unitaire: number;   // Prix unitaire (ex: par mètre pour le câble)
  devise?: string;

  // Champs utiles possibles côté UI (optionnels)
  section_mm2?: number;
  ampacite_A?: number;
  vmp_V?: number;
  voc_V?: number;
}

export interface EquipementsRecommandes {
  panneau: Equipment | null;
  batterie: Equipment | null;
  regulateur: Equipment | null;
  onduleur: Equipment | null;
  cable: Equipment | null;
}

export interface CalculationResult {
  puissance_totale: number;                    // W
  capacite_batterie: number;                   // Ah (niveau parc)
  bilan_energetique_annuel: number;            // Wh/an
  cout_total: number;                          // Ar
  nombre_panneaux: number;
  nombre_batteries: number;

  // (optionnel) FK sérialisés et infos UI
  equipements_recommandes?: EquipementsRecommandes;

  // (optionnel) Topologies renvoyées par l'API
  nb_batt_serie?: number;
  nb_batt_parallele?: number;
  topologie_batterie?: string;
  nb_pv_serie?: number;
  nb_pv_parallele?: number;
  topologie_pv?: string;

  // (optionnel) Câble global
  longueur_cable_global_m?: number;            // m
  prix_cable_global?: number;                  // Ar

  // (optionnel) Identifiant de la ligne créée
  dimensionnement_id?: number;
}

export interface ApiError extends Error {
  message: string;
  status?: number;
  details?: any;
}

// Types pour les réponses de l'API de géocodage (Nominatim)
export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  osm_type: string;
  osm_id: string;
  type?: string;
  importance?: number;
  icon?: string;
}

// Types pour les données d'irradiation (NASA Power API)
export interface IrradiationData {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: Record<string, number>;
    };
  };
}

// Types pour les erreurs API standardisées
export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}

// Types pour la génération PDF
export interface PDFData {
  result: CalculationResult; // inclut désormais topologie + câble (optionnels)
  inputData: CalculationInput;
}

// Types utilitaires pour les formulaires
export type FormValidationError = string;
export type FormValidationErrors = FormValidationError[];

// Types pour les états de chargement
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Types pour les devises supportées
export type Currency = 'MGA' | 'EUR' | 'USD';

// Types pour les tensions de batterie supportées
export type BatteryVoltage = 12 | 24 | 48;
