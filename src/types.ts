export interface PlantLog {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  photoUrl: string;
  heightCm?: number;
  leafCount?: number;
  healthScore?: number; // 0-100
  stage: 'Semis' | 'Bouture' | 'Croissance active' | 'Floraison' | 'Fructification' | 'Mature';
  notes?: string;
  actionsTaken?: string[]; // 'Arrosage', 'Engrais', 'Rempotage', 'Brumisation', 'Taille'
  diagnosis?: PlantDiagnosis;
}

export interface PlantCareAdvice {
  watering: string;
  sunlight: string;
  humidity: string;
  temperature?: string;
  soilAndFertilizer: string;
}

export interface PlantDiagnosis {
  speciesName: string;
  scientificName: string;
  healthScore: number;
  growthStage: string;
  diagnosisSummary: string;
  issuesIdentified: string[];
  careAdvice: PlantCareAdvice;
  estimatedGrowthProgress: string;
  nextActionRecommendation: string;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  scientificName: string;
  category: 'Interieur' | 'Balcon' | 'Succulente & Cactus' | 'Potager & Aromatique' | 'Orchidée' | 'Bonsaï' | 'Autre';
  location: string;
  dateAcquired: string;
  coverImage: string;
  notes?: string;
  wateringIntervalDays: number;
  lastWateredDate?: string;
  logs: PlantLog[];
}

export type SocialPlatform = 
  | 'instagram_post' // 1:1 (1080x1080)
  | 'instagram_story' // 9:16 (1080x1920)
  | 'facebook_feed' // 1.91:1 or 4:5
  | 'tiktok' // 9:16 (1080x1920)
  | 'pinterest_pin' // 2:3 (1000x1500)
  | 'twitter_card'; // 16:9 (1200x675)

export type AdObjective = 
  | 'pub_vente'
  | 'fierte_evolution'
  | 'conseil_tuto'
  | 'concours_engagement'
  | 'story_before_after';

export type AdTheme = 
  | 'botanical_fresh' 
  | 'minimalist_clay' 
  | 'emerald_luxury' 
  | 'modern_pastel' 
  | 'dark_neon_forest';

export interface SocialAdDraft {
  platform: SocialPlatform;
  theme: AdTheme;
  objective: AdObjective;
  shopName: string;
  headline: string;
  hookLine: string;
  caption: string;
  ctaText: string;
  hashtags: string[];
  promotionalBannerText: string;
  discountCode: string;
  priceTag: string;
  badgeText: string;
  showStatsBadge: boolean;
  showBeforeAfterSplit: boolean;
  splitPosition: number; // 0 to 100
  beforeLogId?: string;
  afterLogId?: string;
}
