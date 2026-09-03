import { Plant } from '../types';

export type FertilizerType = 'liquid_mineral' | 'liquid_organic' | 'slow_release_pellets' | 'homemade_tea';
export type Season = 'spring_summer' | 'autumn_winter';

export interface FertilizerRecommendation {
  plantCategory: string;
  recommendedNpk: string;
  npkRationale: string;
  liquidDosePerLiterMl: number; // in ml per 1 Liter of water
  pelletsDoseGrams: number; // in grams if using granules
  sticksCount: number; // sticks count if using fertilizer sticks
  frequencyText: string;
  seasonAdvice: string;
  safetyTips: string[];
}

/**
 * Returns tailored fertilizer formulation benchmarks based on plant category and species.
 */
export function getPlantFertilizerProfile(plant: Plant): FertilizerRecommendation {
  const category = (plant.category || '').toLowerCase();
  const name = (plant.name + ' ' + (plant.scientificName || '')).toLowerCase();

  // 1. Succulents & Cacti
  if (category.includes('succulente') || category.includes('cactus') || name.includes('aloe') || name.includes('sansevieria') || name.includes('cactus')) {
    return {
      plantCategory: 'Succulente & Cactée',
      recommendedNpk: 'NPK 4-6-8 ou 2-7-7 (Riche en Potassium & Phosphore, faible en Azote)',
      npkRationale: 'Les succulentes stockent l\'eau dans leurs tissus ; un excès d\'azote fragilise leur structure et favorise les pourritures.',
      liquidDosePerLiterMl: 1.5,
      pelletsDoseGrams: 5,
      sticksCount: 1,
      frequencyText: '1 fois toutes les 4 à 6 semaines en période active.',
      seasonAdvice: 'Stopper totalement la fertilisation en automne et hiver (période de dormance).',
      safetyTips: [
        'Ne jamais fertiliser un substrat complètement desséché : arroser légèrement à l\'eau claire 24h avant.',
        'Préférer un sous-dosage (moitié de la dose indiquée sur l\'emballage standard).'
      ]
    };
  }

  // 2. Balcony, Aromatic & Vegetable plants
  if (category.includes('balcon') || category.includes('potager') || category.includes('aromatique') || name.includes('basilic') || name.includes('tomate')) {
    return {
      plantCategory: 'Plante de Balcon, Aromatique & Potager',
      recommendedNpk: 'NPK 6-4-6 ou 5-5-7 (Formule Organique équilibrée)',
      npkRationale: 'Nécessite des apports réguliers pour soutenir la floraison, la pousse rapide des feuilles aromatiques et la fructification.',
      liquidDosePerLiterMl: 4.0,
      pelletsDoseGrams: 15,
      sticksCount: 2,
      frequencyText: 'Tous les 10 à 15 jours du printemps à la fin de l\'été.',
      seasonAdvice: 'Réduire à 1 fois par mois à l\'automne.',
      safetyTips: [
        'Utiliser un engrais utilisable en agriculture biologique (UAB) pour les plantes consommables.',
        'Arroser le matin à la fraîche.'
      ]
    };
  }

  // 3. Calathea, Ferns, Orchids & delicate foliage
  if (name.includes('calathea') || name.includes('fougere') || name.includes('orchidee') || name.includes('ficus benjamina')) {
    return {
      plantCategory: 'Plante Tropicale Délicate & Ombrophile',
      recommendedNpk: 'NPK 5-3-5 ou 10-10-10 très dilué (avec oligo-éléments fer/magnésium)',
      npkRationale: 'Leurs racines fines et fragiles sont très sensibles à la salinité et aux excès minéraux.',
      liquidDosePerLiterMl: 2.0,
      pelletsDoseGrams: 8,
      sticksCount: 1,
      frequencyText: '1 fois toutes les 3 semaines pendant la croissance.',
      seasonAdvice: '1 apport léger tous les 2 mois en hiver.',
      safetyTips: [
        'Privilégier de l\'eau non calcaire à température ambiante pour diluer l\'engrais.',
        'Éviter de mouiller le feuillage lors de l\'arrosage fertilisant pour prévenir les brûlures foliaires.'
      ]
    };
  }

  // 4. Large Tropical Indoor foliage (Monstera, Pothos, Ficus Lyrata, Philodendron, Yucca)
  return {
    plantCategory: 'Plante Verte d\'Intérieur Tropicale',
    recommendedNpk: 'NPK 7-3-6 ou 3-1-2 (Riche en Azote pour un feuillage vert profond)',
    npkRationale: 'L\'azote (N) stimule le développement des grandes feuilles et la synthèse chlorophyllienne.',
    liquidDosePerLiterMl: 3.5,
    pelletsDoseGrams: 12,
    sticksCount: 2,
    frequencyText: 'Tous les 15 jours de mars à octobre.',
    seasonAdvice: 'Espacer à 1 fois toutes les 4 à 6 semaines en hiver si la plante continue de produire de nouvelles feuilles sous éclairage.',
    safetyTips: [
      'Toujours diluer l\'engrais liquide dans une eau à température ambiante.',
      'Ne pas fertiliser les plantes récemment rempotées pendant les 4 à 6 premières semaines (le terreau neuf est déjà enrichi).'
    ]
  };
}

export interface CalculatedDosageResult {
  waterVolumeLiters: number;
  plantHeightCm: number;
  season: Season;
  fertilizerType: FertilizerType;
  
  // Dosage calculations
  liquidDoseMl: number;
  liquidDoseDrops: number;
  capFractionText: string;
  pelletsWeightGrams: number;
  sticksRecommended: number;
  
  // Strength and adjustments
  dilutionStrengthPercent: number;
  summaryText: string;
  npkRecommendation: string;
  frequencyAdvice: string;
  potEstimateLiters: number;
}

/**
 * Calculates exact dosage given water volume, plant height, season and formulation.
 */
export function calculateFertilizerDosage(
  plant: Plant,
  waterVolumeLiters: number,
  plantHeightCm: number,
  season: Season = 'spring_summer',
  fertilizerType: FertilizerType = 'liquid_mineral'
): CalculatedDosageResult {
  const profile = getPlantFertilizerProfile(plant);
  
  // Height factor:
  // Base benchmark is 30 cm height.
  // Small (<20cm): 0.75x
  // Medium (20-60cm): 1.0x
  // Tall (60-120cm): 1.25x
  // Giant (>120cm): 1.5x
  let heightFactor = 1.0;
  if (plantHeightCm < 20) {
    heightFactor = 0.75;
  } else if (plantHeightCm <= 60) {
    heightFactor = 1.0;
  } else if (plantHeightCm <= 120) {
    heightFactor = 1.25;
  } else {
    heightFactor = 1.4;
  }

  // Estimated pot size in Liters based on height
  const potEstimateLiters = Math.max(1, Math.round((plantHeightCm / 10) * 1.5));

  // Season factor:
  // Spring/Summer = 1.0x
  // Autumn/Winter = 0.5x
  const seasonFactor = season === 'spring_summer' ? 1.0 : 0.5;

  // Fertilizer type adjustments
  let typeMultiplier = 1.0;
  if (fertilizerType === 'liquid_organic') {
    typeMultiplier = 1.2; // organic liquid is gentler, slightly higher volume
  } else if (fertilizerType === 'homemade_tea') {
    typeMultiplier = 2.0; // purins et thés de compost nécessitent souvent 10% dilution (100ml/L)
  }

  // Base liquid calculation
  const rawLiquidMl = profile.liquidDosePerLiterMl * waterVolumeLiters * heightFactor * seasonFactor * typeMultiplier;
  const liquidDoseMl = Math.round(rawLiquidMl * 10) / 10;
  const liquidDoseDrops = Math.round(liquidDoseMl * 20); // ~20 drops per ml

  // Cap fraction estimate (standard cap is 10ml or 5ml)
  let capFractionText = '';
  if (liquidDoseMl <= 2.5) {
    capFractionText = '¼ de bouchon doseur (~2.5 ml)';
  } else if (liquidDoseMl <= 5) {
    capFractionText = '½ bouchon doseur (~5 ml)';
  } else if (liquidDoseMl <= 10) {
    capFractionText = '1 bouchon complet (~10 ml)';
  } else {
    const caps = Math.round((liquidDoseMl / 10) * 10) / 10;
    capFractionText = `${caps} bouchons doseurs (~${liquidDoseMl} ml)`;
  }

  // Pellets calculation
  const rawPellets = profile.pelletsDoseGrams * heightFactor * (season === 'spring_summer' ? 1.0 : 0.3);
  const pelletsWeightGrams = Math.round(rawPellets);

  // Sticks calculation
  const sticksRecommended = Math.max(1, Math.round(profile.sticksCount * heightFactor));

  // Strength percentage
  const dilutionStrengthPercent = Math.round((seasonFactor * heightFactor) * 100);

  const summaryText = `${liquidDoseMl} ml d'engrais liquide pour ${waterVolumeLiters}L d'eau (${season === 'spring_summer' ? 'Printemps/Été - Pleine croissance' : 'Automne/Hiver - Dose allégée de repos'})`;

  return {
    waterVolumeLiters,
    plantHeightCm,
    season,
    fertilizerType,
    liquidDoseMl,
    liquidDoseDrops,
    capFractionText,
    pelletsWeightGrams,
    sticksRecommended,
    dilutionStrengthPercent,
    summaryText,
    npkRecommendation: profile.recommendedNpk,
    frequencyAdvice: profile.frequencyText,
    potEstimateLiters
  };
}
