import { Plant, PlantLog } from '../types';

export interface TrendTimePoint {
  date: string; // formatted date (e.g. '15 Août')
  fullDate: string;
  rawDate: string; // ISO string
  avgHealth: number; // 0 - 100
  avgHeight: number; // cm
  totalLeaves: number;
  plantsSampled: number;
  [plantKey: string]: any; // plant-specific height or health e.g. plant_plant-1_height
}

export interface PlantGrowthRateSummary {
  plantId: string;
  plantName: string;
  category: string;
  coverImage: string;
  currentHeight: number;
  heightGained: number;
  growthPercentage: number;
  currentHealth: number;
  healthDelta: number;
  leafGained: number;
  currentLeaves: number;
  monthlyVelocityCmPerWeek: number;
  status: 'excellent' | 'good' | 'average' | 'attention';
}

export interface GlobalTrendsSummary {
  timeframeDays: number;
  collectiveAvgHealth: number;
  healthChangePct: number;
  totalHeightGained: number;
  avgGrowthRateCm: number;
  totalNewLeaves: number;
  topPerformingPlant: PlantGrowthRateSummary | null;
  healthDistribution: {
    excellent: number; // count >= 90
    good: number;      // count 75-89
    average: number;   // count 60-74
    attention: number; // count < 60
  };
  timeSeriesData: TrendTimePoint[];
  plantSummaries: PlantGrowthRateSummary[];
}

/**
 * Computes collective health trends and growth rates across all plants for a specified timeframe (default: 30 days / last month).
 */
export function computeGlobalTrends(plants: Plant[], timeframeDays: number = 30): GlobalTrendsSummary {
  if (!plants || plants.length === 0) {
    return {
      timeframeDays,
      collectiveAvgHealth: 0,
      healthChangePct: 0,
      totalHeightGained: 0,
      avgGrowthRateCm: 0,
      totalNewLeaves: 0,
      topPerformingPlant: null,
      healthDistribution: { excellent: 0, good: 0, average: 0, attention: 0 },
      timeSeriesData: [],
      plantSummaries: []
    };
  }

  const now = new Date();
  const startTime = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

  // 1. Compute per-plant metrics over the timeframe
  const plantSummaries: PlantGrowthRateSummary[] = plants.map((plant) => {
    const sortedLogs = [...plant.logs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const logsInPeriod = sortedLogs.filter(
      (l) => new Date(l.date).getTime() >= startTime.getTime()
    );

    // If no logs strictly in the period, fallback to using all logs or latest log
    const firstLog = logsInPeriod.length > 0 ? logsInPeriod[0] : sortedLogs[0];
    const latestLog = sortedLogs[sortedLogs.length - 1];

    const initialHeight = firstLog?.heightCm ?? 15;
    const currentHeight = latestLog?.heightCm ?? initialHeight;
    const heightGained = Math.max(0, currentHeight - initialHeight);

    const initialHealth = firstLog?.healthScore ?? 80;
    const currentHealth = latestLog?.healthScore ?? 85;
    const healthDelta = currentHealth - initialHealth;

    const initialLeaves = firstLog?.leafCount ?? 3;
    const currentLeaves = latestLog?.leafCount ?? initialLeaves;
    const leafGained = Math.max(0, currentLeaves - initialLeaves);

    const growthPercentage = initialHeight > 0 ? Math.round((heightGained / initialHeight) * 100) : 0;
    const weeksInPeriod = Math.max(1, timeframeDays / 7);
    const monthlyVelocityCmPerWeek = Math.round((heightGained / weeksInPeriod) * 10) / 10;

    let status: 'excellent' | 'good' | 'average' | 'attention' = 'good';
    if (currentHealth >= 90) status = 'excellent';
    else if (currentHealth >= 75) status = 'good';
    else if (currentHealth >= 60) status = 'average';
    else status = 'attention';

    return {
      plantId: plant.id,
      plantName: plant.name,
      category: plant.category,
      coverImage: latestLog?.photoUrl || plant.coverImage,
      currentHeight,
      heightGained,
      growthPercentage,
      currentHealth,
      healthDelta,
      leafGained,
      currentLeaves,
      monthlyVelocityCmPerWeek,
      status
    };
  });

  // Health distribution
  const healthDistribution = {
    excellent: plantSummaries.filter((p) => p.status === 'excellent').length,
    good: plantSummaries.filter((p) => p.status === 'good').length,
    average: plantSummaries.filter((p) => p.status === 'average').length,
    attention: plantSummaries.filter((p) => p.status === 'attention').length
  };

  // Top performing plant by height gain and health
  const sortedPerformers = [...plantSummaries].sort(
    (a, b) => b.heightGained * 2 + b.currentHealth - (a.heightGained * 2 + a.currentHealth)
  );
  const topPerformingPlant = sortedPerformers[0] || null;

  // Collective metrics
  const collectiveAvgHealth = Math.round(
    plantSummaries.reduce((acc, p) => acc + p.currentHealth, 0) / (plantSummaries.length || 1)
  );

  const initialAvgHealth = Math.round(
    plants.reduce((acc, p) => {
      const first = p.logs[0];
      return acc + (first?.healthScore ?? 80);
    }, 0) / (plants.length || 1)
  );

  const healthChangePct = collectiveAvgHealth - initialAvgHealth;
  const totalHeightGained = plantSummaries.reduce((acc, p) => acc + p.heightGained, 0);
  const avgGrowthRateCm = Math.round((totalHeightGained / (plants.length || 1)) * 10) / 10;
  const totalNewLeaves = plantSummaries.reduce((acc, p) => acc + p.leafGained, 0);

  // 2. Generate Time Series Data Points (e.g. 5-7 evenly distributed checkpoints over the timeframe)
  // Extract all unique dates from all logs
  const allLogsWithDates: { plantId: string; plantName: string; log: PlantLog }[] = [];
  plants.forEach((p) => {
    p.logs.forEach((log) => {
      allLogsWithDates.push({ plantId: p.id, plantName: p.name, log });
    });
  });

  // If we have distinct dates or generate representative intervals
  const steps = 6;
  const timeSeriesData: TrendTimePoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const pointTimestamp = startTime.getTime() + fraction * (now.getTime() - startTime.getTime());
    const pointDate = new Date(pointTimestamp);

    const formattedDate = pointDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
    const fullDate = pointDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let healthSum = 0;
    let heightSum = 0;
    let leavesSum = 0;
    let plantsCount = 0;
    const dynamicPlantProps: Record<string, number> = {};

    plants.forEach((plant) => {
      // Find latest log of this plant on or before pointTimestamp
      const validLogs = plant.logs
        .filter((l) => new Date(l.date).getTime() <= pointTimestamp)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (validLogs.length > 0) {
        const latestValid = validLogs[validLogs.length - 1];
        const h = latestValid.heightCm ?? 15;
        const hl = latestValid.healthScore ?? 80;
        const lf = latestValid.leafCount ?? 3;

        healthSum += hl;
        heightSum += h;
        leavesSum += lf;
        plantsCount++;

        dynamicPlantProps[`plant_${plant.id}_height`] = h;
        dynamicPlantProps[`plant_${plant.id}_health`] = hl;
      } else if (plant.logs.length > 0) {
        // Linear interpolation or first log reference
        const first = plant.logs[0];
        const h = first.heightCm ?? 15;
        const hl = first.healthScore ?? 80;
        const lf = first.leafCount ?? 3;

        healthSum += hl;
        heightSum += h;
        leavesSum += lf;
        plantsCount++;

        dynamicPlantProps[`plant_${plant.id}_height`] = h;
        dynamicPlantProps[`plant_${plant.id}_health`] = hl;
      }
    });

    const avgHealthAtPoint = plantsCount > 0 ? Math.round(healthSum / plantsCount) : collectiveAvgHealth;
    const avgHeightAtPoint = plantsCount > 0 ? Math.round((heightSum / plantsCount) * 10) / 10 : 0;

    timeSeriesData.push({
      date: formattedDate,
      fullDate,
      rawDate: pointDate.toISOString(),
      avgHealth: avgHealthAtPoint,
      avgHeight: avgHeightAtPoint,
      totalLeaves: leavesSum,
      plantsSampled: plantsCount,
      ...dynamicPlantProps
    });
  }

  return {
    timeframeDays,
    collectiveAvgHealth,
    healthChangePct,
    totalHeightGained,
    avgGrowthRateCm,
    totalNewLeaves,
    topPerformingPlant,
    healthDistribution,
    timeSeriesData,
    plantSummaries
  };
}
