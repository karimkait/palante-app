import { Plant } from '../types';

export interface PlantWateringStatus {
  plantId: string;
  plantName: string;
  plantSpecies: string;
  coverImage: string;
  location: string;
  intervalDays: number;
  lastWateredDate: string;
  nextWateringDate: string;
  daysSinceLastWatered: number;
  daysRemaining: number;
  isOverdue: boolean;
  isDueToday: boolean;
  isUpcoming: boolean; // due within 2 days
  status: 'overdue' | 'due_today' | 'upcoming' | 'ok';
  statusLabel: string;
  badgeColor: string;
  progressPercent: number; // 0 to 100%
}

/**
 * Computes watering status for a single plant.
 */
export function getPlantWateringStatus(plant: Plant): PlantWateringStatus {
  const interval = plant.wateringIntervalDays || 7;
  
  // Determine the most recent watering date:
  // 1. plant.lastWateredDate
  // 2. Or the latest log that includes 'Arrosage'
  // 3. Or plant.dateAcquired
  // 4. Or today
  let lastDateStr = plant.lastWateredDate;

  if (!lastDateStr && plant.logs && plant.logs.length > 0) {
    const wateringLogs = plant.logs
      .filter((l) => l.actionsTaken && l.actionsTaken.some((a) => a.toLowerCase().includes('arros')))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (wateringLogs.length > 0) {
      lastDateStr = wateringLogs[0].date;
    }
  }

  if (!lastDateStr) {
    lastDateStr = plant.dateAcquired || new Date().toISOString().split('T')[0];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = new Date(lastDateStr);
  lastDate.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastDate.getTime();
  const daysSinceLastWatered = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + interval);
  const nextWateringDateStr = nextDate.toISOString().split('T')[0];

  const daysRemaining = interval - daysSinceLastWatered;
  const isOverdue = daysRemaining < 0;
  const isDueToday = daysRemaining === 0;
  const isUpcoming = daysRemaining > 0 && daysRemaining <= 2;

  let status: 'overdue' | 'due_today' | 'upcoming' | 'ok' = 'ok';
  let statusLabel = `Dans ${daysRemaining} jours`;
  let badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30';

  if (isOverdue) {
    status = 'overdue';
    const overdueDays = Math.abs(daysRemaining);
    statusLabel = `En retard (${overdueDays}j)`;
    badgeColor = 'bg-red-950/90 text-red-300 border-red-500/40 animate-pulse';
  } else if (isDueToday) {
    status = 'due_today';
    statusLabel = "À arroser aujourd'hui";
    badgeColor = 'bg-amber-950/90 text-amber-300 border-amber-500/40';
  } else if (isUpcoming) {
    status = 'upcoming';
    statusLabel = daysRemaining === 1 ? 'Demain' : 'Dans 2 jours';
    badgeColor = 'bg-sky-950/80 text-sky-300 border-sky-500/30';
  }

  const progressPercent = Math.min(100, Math.max(0, Math.round((daysSinceLastWatered / interval) * 100)));

  return {
    plantId: plant.id,
    plantName: plant.name,
    plantSpecies: plant.species,
    coverImage: plant.coverImage,
    location: plant.location,
    intervalDays: interval,
    lastWateredDate: lastDateStr,
    nextWateringDate: nextWateringDateStr,
    daysSinceLastWatered,
    daysRemaining,
    isOverdue,
    isDueToday,
    isUpcoming,
    status,
    statusLabel,
    badgeColor,
    progressPercent
  };
}

/**
 * Returns summary stats for all plants watering needs
 */
export function getAllPlantsWateringSummary(plants: Plant[]) {
  const statuses = plants.map(getPlantWateringStatus);
  const overdue = statuses.filter((s) => s.isOverdue);
  const dueToday = statuses.filter((s) => s.isDueToday);
  const upcoming = statuses.filter((s) => s.isUpcoming);
  const ok = statuses.filter((s) => s.status === 'ok');

  const needsWaterCount = overdue.length + dueToday.length;

  return {
    statuses,
    overdue,
    dueToday,
    upcoming,
    ok,
    needsWaterCount,
    hasUrgentAlerts: needsWaterCount > 0
  };
}
