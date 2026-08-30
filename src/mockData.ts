import { Plant } from './types';

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'plant-1',
    name: 'Monstera Stella',
    species: 'Monstera Deliciosa (Faux Philodendron)',
    scientificName: 'Monstera deliciosa',
    category: 'Interieur',
    location: 'Salon près de la baie vitrée',
    dateAcquired: '2025-10-15',
    wateringIntervalDays: 7,
    lastWateredDate: '2026-08-25',
    coverImage: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    notes: 'Bouture reçue d\'un ami passionné. Aime la lumière filtrée et les brumisations le matin.',
    logs: [
      {
        id: 'log-1-1',
        date: '2025-11-01',
        photoUrl: 'https://images.unsplash.com/photo-1596724855580-0a2a4b8ebce0?auto=format&fit=crop&w=800&q=80',
        heightCm: 18,
        leafCount: 3,
        healthScore: 78,
        stage: 'Bouture',
        notes: 'Enracinement réussi en pot de terre cuite. Première petite feuille perforée.',
        actionsTaken: ['Arrosage', 'Brumisation'],
        diagnosis: {
          speciesName: 'Monstera Deliciosa',
          scientificName: 'Monstera deliciosa',
          healthScore: 78,
          growthStage: 'Enracinement / Jeune plant',
          diagnosisSummary: 'Système racinaire sain, début de fenestration des feuilles prometteur.',
          issuesIdentified: ['Léger manque de lumière au début', 'Bonne tenue du pétiole'],
          careAdvice: {
            watering: 'Attendre que les 3 premiers cm soient secs',
            sunlight: 'Lumière vive tamisée sans soleil direct',
            humidity: '60% idéalement, brumiser 2x par semaine',
            soilAndFertilizer: 'Terreau léger drainant avec écorces et perlite'
          },
          estimatedGrowthProgress: 'Développement normal pour une jeune bouture.',
          nextActionRecommendation: 'Placer un petit tuteur en fibre de coco.'
        }
      },
      {
        id: 'log-1-2',
        date: '2026-03-15',
        photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
        heightCm: 34,
        leafCount: 6,
        healthScore: 92,
        stage: 'Croissance active',
        notes: 'Explosion printanière ! 3 nouvelles feuilles massives avec de superbes découpes.',
        actionsTaken: ['Arrosage', 'Engrais', 'Rempotage'],
        diagnosis: {
          speciesName: 'Monstera Deliciosa',
          scientificName: 'Monstera deliciosa',
          healthScore: 92,
          growthStage: 'Croissance végétative vigoureuse',
          diagnosisSummary: 'Excellente vitalité ! Grandes feuilles lustrées au vert profond.',
          issuesIdentified: ['Aucune maladie détectée', 'Croissance très rapide'],
          careAdvice: {
            watering: 'Arrosage généreux tous les 6-7 jours',
            sunlight: 'Emplacement actuel parfait',
            humidity: 'Humidité ambiante optimale',
            soilAndFertilizer: 'Engrais plantes vertes dilué 1 fois par mois'
          },
          estimatedGrowthProgress: '+88% de hauteur et doublement de la surface foliaire en 4 mois !',
          nextActionRecommendation: 'Nettoyer doucement les feuilles avec un chiffon humide.'
        }
      },
      {
        id: 'log-1-3',
        date: '2026-08-20',
        photoUrl: 'https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=800&q=80',
        heightCm: 52,
        leafCount: 11,
        healthScore: 97,
        stage: 'Mature',
        notes: 'Plante maîtresse du salon ! Feuilles géantes avec doubles fenestrations.',
        actionsTaken: ['Arrosage', 'Engrais', 'Brumisation', 'Taille'],
        diagnosis: {
          speciesName: 'Monstera Deliciosa',
          scientificName: 'Monstera deliciosa',
          healthScore: 97,
          growthStage: 'Plante adulte épanouie',
          diagnosisSummary: 'Spécimen remarquable en pleine santé.',
          issuesIdentified: ['Racines aériennes robustes', 'Feuillage éclatant'],
          careAdvice: {
            watering: 'Maintenir la régularité habituelle',
            sunlight: 'Très bien équilibré',
            humidity: 'Excellente adaptation',
            soilAndFertilizer: 'Poursuivre la nutrition estivale'
          },
          estimatedGrowthProgress: 'Croissance totale spectaculaire (+188% de taille depuis le départ).',
          nextActionRecommendation: 'Guider les racines aériennes vers le terreau.'
        }
      }
    ]
  },
  {
    id: 'plant-2',
    name: 'Pilea Penny',
    species: 'Pilea Peperomioides (Plante à Monnaie Chinoise)',
    scientificName: 'Pilea peperomioides',
    category: 'Interieur',
    location: 'Bureau étagère Est',
    dateAcquired: '2026-01-10',
    wateringIntervalDays: 5,
    lastWateredDate: '2026-08-27',
    coverImage: 'https://images.unsplash.com/photo-1599818817757-5e65651c6c59?auto=format&fit=crop&w=800&q=80',
    notes: 'Donne énormément de rejetons ! Parfait pour faire des boutures et les offrir.',
    logs: [
      {
        id: 'log-2-1',
        date: '2026-02-01',
        photoUrl: 'https://images.unsplash.com/photo-1599818817757-5e65651c6c59?auto=format&fit=crop&w=800&q=80',
        heightCm: 10,
        leafCount: 5,
        healthScore: 82,
        stage: 'Semis',
        notes: 'Jeune pousse avec petites feuilles rondes bien vertes.',
        actionsTaken: ['Arrosage']
      },
      {
        id: 'log-2-2',
        date: '2026-08-15',
        photoUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
        heightCm: 26,
        leafCount: 19,
        healthScore: 95,
        stage: 'Croissance active',
        notes: 'Port dressé magnifique, tiges robustes et 4 bébés rejets apparus à la base !',
        actionsTaken: ['Arrosage', 'Engrais', 'Brumisation'],
        diagnosis: {
          speciesName: 'Pilea Peperomioides',
          scientificName: 'Pilea peperomioides',
          healthScore: 95,
          growthStage: 'Adulte vigoureux avec rejets',
          diagnosisSummary: 'Excellente symétrie, feuilles fermes et lustrées.',
          issuesIdentified: ['Très bonne santé globale'],
          careAdvice: {
            watering: 'Arroser quand la terre commence à sécher sur 2 cm',
            sunlight: 'Lumière abondante sans soleil direct pour éviter de brûler les feuilles rondes',
            humidity: 'Humidité moyenne de maison',
            soilAndFertilizer: 'Terreau bien aéré'
          },
          estimatedGrowthProgress: '+160% de croissance en 6 mois.',
          nextActionRecommendation: 'Séparer les rejets pour créer de nouvelles plantes.'
        }
      }
    ]
  },
  {
    id: 'plant-3',
    name: 'Calathea Paon',
    species: 'Calathea Makoyana (Plante Paon)',
    scientificName: 'Calathea makoyana',
    category: 'Interieur',
    location: 'Chambre tamisée',
    dateAcquired: '2026-03-01',
    wateringIntervalDays: 4,
    lastWateredDate: '2026-08-28',
    coverImage: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=800&q=80',
    notes: 'Feuilles qui se redressent le soir comme pour prier. Aime l\'eau non calcaire filtrée.',
    logs: [
      {
        id: 'log-3-1',
        date: '2026-03-10',
        photoUrl: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=800&q=80',
        heightCm: 15,
        leafCount: 4,
        healthScore: 80,
        stage: 'Bouture',
        notes: 'Bouture installée en pot auto-arrosant.',
        actionsTaken: ['Arrosage', 'Brumisation']
      },
      {
        id: 'log-3-2',
        date: '2026-07-25',
        photoUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
        heightCm: 32,
        leafCount: 14,
        healthScore: 94,
        stage: 'Croissance active',
        notes: 'Motifs violet/vert ultra contrastés !',
        actionsTaken: ['Arrosage', 'Brumisation', 'Engrais']
      }
    ]
  }
];
