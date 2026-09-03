import { Plant } from '../types';

export type ChallengeCategory = 'watering' | 'collection' | 'growth' | 'care' | 'creativity' | 'mastery';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface GardeningChallenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  badgeName: string;
  badgeIcon: string; // Emoji / Icon symbol
  badgeColor: string; // Accent color hex
  badgeTier: BadgeTier;
  xpPoints: number;
  actionCta?: {
    label: string;
    tab?: string;
    actionKey?: string;
  };
}

export interface UserGardeningLevel {
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  levelProgressPercent: number;
  totalUnlockedBadges: number;
  totalChallengesCount: number;
}

// Local storage key for persistent challenge state overrides (e.g. streaks or manual diagnostic triggers)
const CHALLENGES_STORAGE_KEY = 'botanica_challenges_meta_v1';

interface ChallengeMetaState {
  wateringStreakDays: number;
  lastWateringStreakDate: string;
  diagnosticsRunCount: number;
  adsCreatedCount: number;
  unlockedOverrideDates: Record<string, string>;
}

export function getChallengeMetaState(): ChallengeMetaState {
  try {
    const raw = localStorage.getItem(CHALLENGES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }

  // Sensible starting state based on mock data (e.g. 7 days of streak, 2 diagnostics)
  return {
    wateringStreakDays: 8,
    lastWateringStreakDate: new Date().toISOString().split('T')[0],
    diagnosticsRunCount: 2,
    adsCreatedCount: 1,
    unlockedOverrideDates: {
      first_log_photo: '2025-11-01',
      stage_propagation: '2026-02-01'
    }
  };
}

export function saveChallengeMetaState(state: ChallengeMetaState): void {
  try {
    localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save challenge state:', e);
  }
}

/**
 * Increments watering streak or registers a watering action.
 */
export function recordWateringStreakAction(): number {
  const state = getChallengeMetaState();
  const today = new Date().toISOString().split('T')[0];

  if (state.lastWateringStreakDate !== today) {
    state.wateringStreakDays = Math.min(10, state.wateringStreakDays + 1);
    state.lastWateringStreakDate = today;
  }
  saveChallengeMetaState(state);
  return state.wateringStreakDays;
}

/**
 * Registers an AI diagnostic run.
 */
export function recordDiagnosticRun(): void {
  const state = getChallengeMetaState();
  state.diagnosticsRunCount = (state.diagnosticsRunCount || 0) + 1;
  saveChallengeMetaState(state);
}

/**
 * Registers a social ad creation / share.
 */
export function recordAdCreated(): void {
  const state = getChallengeMetaState();
  state.adsCreatedCount = (state.adsCreatedCount || 0) + 1;
  saveChallengeMetaState(state);
}

/**
 * Computes all gardening challenges and badges based on current plants and meta state.
 */
export function computeGardeningChallenges(plants: Plant[]): {
  challenges: GardeningChallenge[];
  userLevel: UserGardeningLevel;
} {
  const meta = getChallengeMetaState();
  const todayStr = new Date().toISOString().split('T')[0];

  // Plant stats calculation
  const totalPlantsCount = plants.length;
  const totalPhotosLogged = plants.reduce((acc, p) => acc + p.logs.length, 0);

  // Total growth in cm gained
  let totalGrowthGainedCm = 0;
  plants.forEach((p) => {
    if (p.logs.length >= 2) {
      const sorted = [...p.logs].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstH = sorted[0].heightCm ?? 15;
      const lastH = sorted[sorted.length - 1].heightCm ?? firstH;
      totalGrowthGainedCm += Math.max(0, lastH - firstH);
    }
  });

  // Distinct categories count
  const distinctCategories = new Set(plants.map((p) => p.category));
  const distinctCategoriesCount = distinctCategories.size;

  // Plants with health score >= 95
  const superHealthyPlantsCount = plants.filter((p) => {
    const latestLog = p.logs[p.logs.length - 1];
    return (latestLog?.healthScore ?? 80) >= 95;
  }).length;

  // Has propagation or seedling
  const hasPropagation = plants.some((p) =>
    p.logs.some((l) => l.stage === 'Bouture' || l.stage === 'Semis')
  );

  // Define Challenge List
  const rawChallenges: GardeningChallenge[] = [
    {
      id: 'watering_streak_10',
      title: "10 Jours d'Arrosage Parfait",
      description: "Maintenez un calendrier d'arrosage rigoureux sans aucun retard pendant 10 jours consécutifs.",
      category: 'watering',
      currentProgress: Math.min(10, meta.wateringStreakDays),
      targetProgress: 10,
      unit: 'jours',
      isUnlocked: meta.wateringStreakDays >= 10,
      unlockedDate: meta.wateringStreakDays >= 10 ? meta.unlockedOverrideDates['watering_streak_10'] || todayStr : undefined,
      badgeName: "Maître de l'Hydratation",
      badgeIcon: '💧',
      badgeColor: '#06b6d4', // cyan
      badgeTier: 'gold',
      xpPoints: 150,
      actionCta: { label: 'Voir les arrosages', actionKey: 'open_watering' }
    },
    {
      id: 'collection_5_plants',
      title: '5 Nouvelles Plantes Ajoutées',
      description: 'Développez votre oasis végétale en ajoutant au moins 5 plantes uniques dans votre jardin.',
      category: 'collection',
      currentProgress: Math.min(5, totalPlantsCount),
      targetProgress: 5,
      unit: 'plantes',
      isUnlocked: totalPlantsCount >= 5,
      unlockedDate: totalPlantsCount >= 5 ? meta.unlockedOverrideDates['collection_5_plants'] || todayStr : undefined,
      badgeName: 'Collectionneur Émeraude',
      badgeIcon: '🌿',
      badgeColor: '#10b981', // emerald
      badgeTier: 'gold',
      xpPoints: 200,
      actionCta: { label: 'Ajouter une plante', actionKey: 'add_plant' }
    },
    {
      id: 'growth_gain_30cm',
      title: 'Maître de la Croissance (+30 cm)',
      description: 'Faites grandir vos plantes d\'un cumul supérieur à 30 cm de hauteur au fil des semaines.',
      category: 'growth',
      currentProgress: Math.min(30, Math.round(totalGrowthGainedCm)),
      targetProgress: 30,
      unit: 'cm',
      isUnlocked: totalGrowthGainedCm >= 30,
      unlockedDate: totalGrowthGainedCm >= 30 ? '2026-08-15' : undefined,
      badgeName: 'Alchimiste de la Croissance',
      badgeIcon: '🌱',
      badgeColor: '#84cc16', // lime
      badgeTier: 'gold',
      xpPoints: 180,
      actionCta: { label: 'Voir l\'évolution', tab: 'timeline' }
    },
    {
      id: 'photos_10_logs',
      title: 'Photographe Botanique (10 Photos)',
      description: 'Documentez la chronologie de vos plantes avec au moins 10 clichés de suivi photographiques.',
      category: 'care',
      currentProgress: Math.min(10, totalPhotosLogged),
      targetProgress: 10,
      unit: 'photos',
      isUnlocked: totalPhotosLogged >= 10,
      unlockedDate: totalPhotosLogged >= 10 ? '2026-08-20' : undefined,
      badgeName: 'Chroniqueur Végétal',
      badgeIcon: '📸',
      badgeColor: '#8b5cf6', // violet
      badgeTier: 'silver',
      xpPoints: 120,
      actionCta: { label: 'Prendre une photo', actionKey: 'quick_camera' }
    },
    {
      id: 'health_master_95',
      title: 'Vitalité Suprême (Santé 95+)',
      description: 'Amenez au moins 2 de vos plantes à un score de santé exceptionnel supérieur ou égal à 95/100.',
      category: 'mastery',
      currentProgress: Math.min(2, superHealthyPlantsCount),
      targetProgress: 2,
      unit: 'plantes',
      isUnlocked: superHealthyPlantsCount >= 2,
      unlockedDate: superHealthyPlantsCount >= 2 ? '2026-08-15' : undefined,
      badgeName: 'Main Verte Légendaire',
      badgeIcon: '👑',
      badgeColor: '#f59e0b', // amber / gold
      badgeTier: 'diamond',
      xpPoints: 250,
      actionCta: { label: 'Consulter la santé', tab: 'trends' }
    },
    {
      id: 'ai_diagnosis_run',
      title: 'Docteur des Plantes IA',
      description: 'Analysez la santé d\'une plante grâce au diagnostic intelligent par vision artificielle.',
      category: 'care',
      currentProgress: Math.min(3, meta.diagnosticsRunCount),
      targetProgress: 3,
      unit: 'diagnostics',
      isUnlocked: meta.diagnosticsRunCount >= 3,
      unlockedDate: meta.diagnosticsRunCount >= 3 ? todayStr : undefined,
      badgeName: 'Phytothérapeute IA',
      badgeIcon: '🩺',
      badgeColor: '#ec4899', // pink
      badgeTier: 'silver',
      xpPoints: 100,
      actionCta: { label: 'Lancer un diagnostic', tab: 'ai_doctor' }
    },
    {
      id: 'variety_3_categories',
      title: 'Jungle Diversifiée (3 Variétés)',
      description: 'Cultivez des espèces issues d\'au moins 3 catégories différentes (Intérieur, Succulente, Balcon...).',
      category: 'collection',
      currentProgress: Math.min(3, distinctCategoriesCount),
      targetProgress: 3,
      unit: 'catégories',
      isUnlocked: distinctCategoriesCount >= 3,
      unlockedDate: distinctCategoriesCount >= 3 ? '2026-03-01' : undefined,
      badgeName: 'Jungle Urbaine',
      badgeIcon: '🌴',
      badgeColor: '#14b8a6', // teal
      badgeTier: 'silver',
      xpPoints: 100,
      actionCta: { label: 'Ajouter une plante', actionKey: 'add_plant' }
    },
    {
      id: 'social_ad_creative',
      title: 'Studio & Partage Réseaux',
      description: 'Générez et partagez une composition publicitaire d\'évolution végétale dans le SocialAdStudio.',
      category: 'creativity',
      currentProgress: Math.min(1, meta.adsCreatedCount),
      targetProgress: 1,
      unit: 'partage',
      isUnlocked: meta.adsCreatedCount >= 1,
      unlockedDate: meta.adsCreatedCount >= 1 ? '2026-08-25' : undefined,
      badgeName: 'Influenceur Vert',
      badgeIcon: '✨',
      badgeColor: '#3b82f6', // blue
      badgeTier: 'silver',
      xpPoints: 110,
      actionCta: { label: 'Créer une pub', tab: 'ads_studio' }
    },
    {
      id: 'stage_propagation',
      title: 'Pépiniériste Initié',
      description: 'Avoir démarré avec succès une bouture ou un jeune semis dans votre collection.',
      category: 'growth',
      currentProgress: hasPropagation ? 1 : 0,
      targetProgress: 1,
      unit: 'bouture',
      isUnlocked: hasPropagation,
      unlockedDate: hasPropagation ? '2026-02-01' : undefined,
      badgeName: 'Graine d\'Avenir',
      badgeIcon: '🎍',
      badgeColor: '#10b981',
      badgeTier: 'bronze',
      xpPoints: 70
    },
    {
      id: 'first_log_photo',
      title: 'Première Prise de Vue',
      description: 'Enregistrer votre première photo de suivi pour immortaliser la naissance d\'une feuille.',
      category: 'care',
      currentProgress: totalPhotosLogged > 0 ? 1 : 0,
      targetProgress: 1,
      unit: 'photo',
      isUnlocked: totalPhotosLogged > 0,
      unlockedDate: totalPhotosLogged > 0 ? '2025-11-01' : undefined,
      badgeName: 'Œil Botaniste',
      badgeIcon: '👁️',
      badgeColor: '#6366f1',
      badgeTier: 'bronze',
      xpPoints: 50
    }
  ];

  // Calculate total XP from unlocked challenges
  const totalXp = rawChallenges
    .filter((c) => c.isUnlocked)
    .reduce((acc, c) => acc + c.xpPoints, 0);

  // Compute User Level Hierarchy
  let level = 1;
  let levelTitle = 'Graine Curieuse';
  let nextLevelXp = 250;

  if (totalXp >= 1000) {
    level = 5;
    levelTitle = 'Légende Botanique';
    nextLevelXp = 1500;
  } else if (totalXp >= 650) {
    level = 4;
    levelTitle = 'Maître de la Jungle Urbaine';
    nextLevelXp = 1000;
  } else if (totalXp >= 350) {
    level = 3;
    levelTitle = 'Botaniste Émérite';
    nextLevelXp = 650;
  } else if (totalXp >= 150) {
    level = 2;
    levelTitle = 'Jardinier Passionné';
    nextLevelXp = 350;
  }

  const prevLevelBaseXp = level === 1 ? 0 : level === 2 ? 150 : level === 3 ? 350 : level === 4 ? 650 : 1000;
  const levelProgressPercent = Math.min(
    100,
    Math.round(((totalXp - prevLevelBaseXp) / (nextLevelXp - prevLevelBaseXp)) * 100)
  );

  const totalUnlockedBadges = rawChallenges.filter((c) => c.isUnlocked).length;

  return {
    challenges: rawChallenges,
    userLevel: {
      level,
      levelTitle,
      currentXp: totalXp,
      nextLevelXp,
      levelProgressPercent,
      totalUnlockedBadges,
      totalChallengesCount: rawChallenges.length
    }
  };
}
