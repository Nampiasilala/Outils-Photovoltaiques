// utils/formatters.ts - Fonctions de formatage centralisées

/**
 * Formate un prix en Ariary avec séparateurs de milliers
 * Utilise des espaces normaux (compatible PDF)
 */
export const formatPrice = (n?: number | null): string => {
  if (typeof n !== 'number') return '—';
  
  // Formatage manuel pour éviter les espaces insécables
  const str = n.toString();
  const formatted = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} Ar`;
};

/**
 * Formate l'énergie avec unité adaptée (Wh ou kWh)
 * Avec gestion des valeurs nulles/undefined
 */
export const formatEnergy = (wh?: number | null): string => {
  if (typeof wh !== 'number') return '—';
  
  // Si >= 1000 Wh, convertir en kWh pour plus de lisibilité
  if (wh >= 1000) {
    // Formatage manuel pour éviter les espaces insécables dans les PDF
    const kwhValue = (wh / 1000).toFixed(1);
    return `${kwhValue} kWh`;
  }
  
  // Sinon garder en Wh
  const formatted = wh.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} Wh`;
};

/**
 * Version avec toLocaleString pour l'affichage web (plus jolie)
 * À utiliser dans les composants React uniquement (pas dans les PDF)
 */
export const formatEnergyLocale = (wh?: number | null): string => {
  if (typeof wh !== 'number') return '—';
  
  if (wh >= 1000) {
    return `${(wh / 1000).toLocaleString('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })} kWh`;
  }
  
  return `${wh.toLocaleString('fr-FR')} Wh`;
};

/**
 * Formate une date en français
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value?: number | null, decimals = 1): string => {
  if (typeof value !== 'number') return '—';
  return `${value.toFixed(decimals)} %`;
};

/**
 * Formate une puissance (W, kW, MW)
 */
export const formatPower = (watts?: number | null): string => {
  if (typeof watts !== 'number') return '—';
  
  if (watts >= 1000000) {
    return `${(watts / 1000000).toFixed(1)} MW`;
  } else if (watts >= 1000) {
    return `${(watts / 1000).toFixed(1)} kW`;
  }
  
  return `${watts} W`;
};

/**
 * Formate une capacité de batterie (Ah)
 */
export const formatCapacity = (ah?: number | null): string => {
  if (typeof ah !== 'number') return '—';
  return `${ah} Ah`;
};

/**
 * Formate une tension (V)
 */
export const formatVoltage = (volts?: number | null): string => {
  if (typeof volts !== 'number') return '—';
  return `${volts} V`;
};

/**
 * Sanitise un nom de fichier en supprimant les caractères spéciaux
 */
export const sanitizeFilename = (str: string, maxLength = 20): string => {
  return str.replace(/[^a-zA-Z0-9]/g, '-').substring(0, maxLength);
};

/**
 * Formate un nombre avec séparateurs de milliers (version générique)
 */
export const formatNumber = (n?: number | null, decimals = 0): string => {
  if (typeof n !== 'number') return '—';
  
  const formatted = n.toFixed(decimals);
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Collection de toutes les fonctions de formatage
 * Pratique pour l'import en une fois
 */
export const formatters = {
  price: formatPrice,
  energy: formatEnergy,
  energyLocale: formatEnergyLocale,
  date: formatDate,
  percentage: formatPercentage,
  power: formatPower,
  capacity: formatCapacity,
  voltage: formatVoltage,
  filename: sanitizeFilename,
  number: formatNumber,
} as const;