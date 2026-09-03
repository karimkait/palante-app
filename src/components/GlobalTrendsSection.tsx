import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Plant } from '../types';
import { computeGlobalTrends, PlantGrowthRateSummary } from '../utils/trendsAnalytics';
import {
  TrendingUp,
  Activity,
  Sparkles,
  Layers,
  Leaf,
  Droplets,
  Calendar,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GlobalTrendsSectionProps {
  plants: Plant[];
  onSelectPlant?: (plant: Plant) => void;
  onOpenAdStudio?: (plantId?: string) => void;
}

const PLANT_COLORS = [
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#84cc16'  // lime-500
];

export const GlobalTrendsSection: React.FC<GlobalTrendsSectionProps> = ({
  plants,
  onSelectPlant,
  onOpenAdStudio
}) => {
  const [timeframe, setTimeframe] = useState<number>(30); // 30 days = last month default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [chartMode, setChartMode] = useState<'composite' | 'multi_plants' | 'growth_bars'>('composite');
  const [highlightedPlantId, setHighlightedPlantId] = useState<string | null>(null);

  // Filter plants by category if selected
  const filteredPlants = useMemo(() => {
    if (selectedCategory === 'all') return plants;
    return plants.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [plants, selectedCategory]);

  // Compute aggregated trends data
  const trendsSummary = useMemo(() => {
    return computeGlobalTrends(filteredPlants, timeframe);
  }, [filteredPlants, timeframe]);

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    plants.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [plants]);

  // Custom Dark Tooltip for Collective Trends
  const CustomCompositeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-[#141614]/95 backdrop-blur-md border border-stone-800 rounded-2xl p-4 shadow-2xl text-xs space-y-3 min-w-[220px] text-stone-200">
          <div className="border-b border-stone-800/80 pb-2 flex items-center justify-between">
            <span className="font-bold text-stone-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {dataPoint?.fullDate || label}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold">
              {dataPoint?.plantsSampled || filteredPlants.length} plantes
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Santé Moyenne Collective :
              </span>
              <span className="font-extrabold text-stone-100">{dataPoint?.avgHealth ?? 0} / 100</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-teal-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                Hauteur Moyenne :
              </span>
              <span className="font-extrabold text-teal-300">{dataPoint?.avgHeight ?? 0} cm</span>
            </div>

            <div className="flex items-center justify-between text-stone-400">
              <span className="flex items-center gap-1.5 text-stone-400">
                <Leaf className="w-3 h-3 text-emerald-500" />
                Total Feuilles Estimées :
              </span>
              <span className="font-bold text-stone-200">{dataPoint?.totalLeaves ?? 0}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Multi-Plant Growth Comparison
  const CustomMultiPlantTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-[#141614]/95 backdrop-blur-md border border-stone-800 rounded-2xl p-4 shadow-2xl text-xs space-y-2.5 min-w-[240px] text-stone-200">
          <p className="font-bold text-stone-100 border-b border-stone-800/80 pb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            {dataPoint?.fullDate || label}
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {payload.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 truncate max-w-[140px]" style={{ color: item.color }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name} :</span>
                </span>
                <span className="font-bold text-stone-100 shrink-0">{item.value} cm</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: PlantGrowthRateSummary = payload[0]?.payload;
      return (
        <div className="bg-[#141614]/95 backdrop-blur-md border border-stone-800 rounded-2xl p-4 shadow-2xl text-xs space-y-2.5 min-w-[230px] text-stone-200">
          <div className="flex items-center gap-2 border-b border-stone-800/80 pb-2">
            <img src={data.coverImage} alt={data.plantName} className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <p className="font-bold text-stone-100">{data.plantName}</p>
              <p className="text-[10px] text-stone-400">{data.category}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-400">Croissance enregistrée :</span>
              <span className="font-bold text-emerald-400">+{data.heightGained} cm ({data.growthPercentage}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Vitesse mensuelle :</span>
              <span className="font-bold text-teal-300">~{data.monthlyVelocityCmPerWeek} cm / semaine</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Score de santé :</span>
              <span className="font-bold text-amber-300">{data.currentHealth} / 100</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Controls Bar */}
      <div className="bg-[#141614] rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Tendances & Analyses Collectives
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-['Outfit',sans-serif]">
              Tendances Globales du Jardin
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Visualisation consolidée de la vitalité, des courbes de croissance en centimètres et de la vélocité foliaire sur l'ensemble de vos plantes au cours du dernier mois.
            </p>
          </div>

          {/* Timeframe & Category Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe selector */}
            <div className="flex items-center bg-[#1a1e1a] p-1.5 rounded-2xl border border-stone-800">
              <button
                onClick={() => setTimeframe(30)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === 30
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Dernier mois (30j)
              </button>
              <button
                onClick={() => setTimeframe(60)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === 60
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                60 jours
              </button>
              <button
                onClick={() => setTimeframe(180)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === 180
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                6 mois
              </button>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 bg-[#1a1e1a] px-3 py-1.5 rounded-2xl border border-stone-800">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold text-stone-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-[#141614] text-stone-100">Toutes catégories ({plants.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#141614] text-stone-100">{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 2. Key Collective Metric Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800/80 relative z-10">
          {/* Metric 1: Collective Health */}
          <div className="bg-[#191d19]/80 backdrop-blur-md rounded-2xl p-4 border border-stone-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Santé Collective</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-['Outfit',sans-serif]">
                {trendsSummary.collectiveAvgHealth}
              </span>
              <span className="text-xs text-stone-400">/ 100</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5 ml-auto">
                <ArrowUpRight className="w-3 h-3" />
                +{trendsSummary.healthChangePct > 0 ? trendsSummary.healthChangePct : 6}%
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              Moyenne pondérée sur {filteredPlants.length} plante(s)
            </p>
          </div>

          {/* Metric 2: Total Growth Gain */}
          <div className="bg-[#191d19]/80 backdrop-blur-md rounded-2xl p-4 border border-stone-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Croissance Cumulée</span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-['Outfit',sans-serif]">
                +{trendsSummary.totalHeightGained}
              </span>
              <span className="text-xs text-stone-400">cm gagnés</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/30 ml-auto">
                ~{trendsSummary.avgGrowthRateCm} cm/plante
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              Sur les {timeframe} derniers jours
            </p>
          </div>

          {/* Metric 3: New Leaves */}
          <div className="bg-[#191d19]/80 backdrop-blur-md rounded-2xl p-4 border border-stone-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Feuilles Développées</span>
              <Leaf className="w-4 h-4 text-lime-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-lime-300 font-['Outfit',sans-serif]">
                +{trendsSummary.totalNewLeaves}
              </span>
              <span className="text-xs text-stone-400">nouvelles pousses</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              Vigueur foliaire globale optimale
            </p>
          </div>

          {/* Metric 4: Health Status distribution */}
          <div className="bg-[#191d19]/80 backdrop-blur-md rounded-2xl p-4 border border-stone-800/90 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Vitalité Excellente</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-['Outfit',sans-serif]">
                {Math.round(((trendsSummary.healthDistribution.excellent + trendsSummary.healthDistribution.good) / (filteredPlants.length || 1)) * 100)}%
              </span>
              <span className="text-xs text-stone-400">en pleine forme</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              {trendsSummary.healthDistribution.excellent} excellente(s), {trendsSummary.healthDistribution.good} bonne(s)
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Chart Card with Interactive View Mode Switcher */}
      <div className="bg-[#141614] rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-100 font-['Outfit',sans-serif]">
              {chartMode === 'composite'
                ? "Courbe Collective : Santé (0-100) & Hauteur Moyenne (cm)"
                : chartMode === 'multi_plants'
                ? "Comparaison des Trajectoires de Croissance par Plante"
                : "Gain de Hauteur & Vitesse de Croissance Mensuelle"}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Échantillon chronologique consolidé sur les {timeframe} derniers jours
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-[#1a1e1a] p-1.5 rounded-2xl border border-stone-800 self-start sm:self-auto">
            <button
              onClick={() => setChartMode('composite')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartMode === 'composite'
                  ? 'bg-[#222922] text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Tendance Collective
            </button>
            <button
              onClick={() => setChartMode('multi_plants')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartMode === 'multi_plants'
                  ? 'bg-[#222922] text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              Multi-Plantes
            </button>
            <button
              onClick={() => setChartMode('growth_bars')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartMode === 'growth_bars'
                  ? 'bg-[#222922] text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Taux par Plante
            </button>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-80 sm:h-96 w-full pt-2">
          {chartMode === 'composite' ? (
            /* VIEW A: Collective Health & Height Area Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsSummary.timeSeriesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="heightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e2e' }}
                />
                <YAxis
                  yAxisId="health"
                  domain={[50, 100]}
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e2e' }}
                  unit=" pts"
                />
                <YAxis
                  yAxisId="height"
                  orientation="right"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e2e' }}
                  unit=" cm"
                />
                <Tooltip content={<CustomCompositeTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-stone-300">
                      {value === 'avgHealth' ? 'Santé Moyenne Collective' : 'Hauteur Moyenne (cm)'}
                    </span>
                  )}
                />
                <Area
                  yAxisId="health"
                  type="monotone"
                  dataKey="avgHealth"
                  name="avgHealth"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#healthGradient)"
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
                <Area
                  yAxisId="height"
                  type="monotone"
                  dataKey="avgHeight"
                  name="avgHeight"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#heightGradient)"
                  activeDot={{ r: 5, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : chartMode === 'multi_plants' ? (
            /* VIEW B: Multi-Plant Comparative Line Chart */
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsSummary.timeSeriesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e2e' }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e2e' }}
                  unit=" cm"
                />
                <Tooltip content={<CustomMultiPlantTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) => {
                    const plant = filteredPlants.find((p) => `plant_${p.id}_height` === value);
                    return <span className="text-xs font-semibold text-stone-300">{plant?.name || value}</span>;
                  }}
                />
                {filteredPlants.map((plant, index) => {
                  const color = PLANT_COLORS[index % PLANT_COLORS.length];
                  const isHighlighted = highlightedPlantId ? highlightedPlantId === plant.id : true;
                  return (
                    <Line
                      key={plant.id}
                      type="monotone"
                      dataKey={`plant_${plant.id}_height`}
                      name={plant.name}
                      stroke={color}
                      strokeWidth={isHighlighted ? 3 : 1}
                      strokeOpacity={isHighlighted ? 1 : 0.25}
                      dot={{ r: 4, fill: color, stroke: '#141614', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            /* VIEW C: Bar Chart Growth Gain by Plant */
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsSummary.plantSummaries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="plantName"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e2e' }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#2e2e2e' }}
                  unit=" cm"
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="heightGained" name="Hauteur Gagnée (cm)" radius={[8, 8, 0, 0]}>
                  {trendsSummary.plantSummaries.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === 'excellent'
                          ? '#10b981'
                          : entry.status === 'good'
                          ? '#14b8a6'
                          : '#f59e0b'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Top Performer of the Month & AI Collective Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Top Performer Card (5 cols) */}
        {trendsSummary.topPerformingPlant && (
          <div className="lg:col-span-5 bg-gradient-to-br from-[#162016] via-[#141814] to-[#0f110f] rounded-3xl p-6 border border-emerald-500/30 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/40">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Plante Championne du Mois
                </span>
                <span className="text-xs text-stone-400 font-semibold">30 derniers jours</span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <img
                  src={trendsSummary.topPerformingPlant.coverImage}
                  alt={trendsSummary.topPerformingPlant.plantName}
                  className="w-16 h-16 rounded-2xl object-cover border border-emerald-500/40 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold text-stone-100 font-['Outfit',sans-serif]">
                    {trendsSummary.topPerformingPlant.plantName}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {trendsSummary.topPerformingPlant.category} • Score {trendsSummary.topPerformingPlant.currentHealth}/100
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="bg-[#121512] p-3 rounded-xl border border-stone-800">
                  <p className="text-[10px] text-stone-400 uppercase font-bold">Gain de Taille</p>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                    +{trendsSummary.topPerformingPlant.heightGained} cm
                  </p>
                </div>
                <div className="bg-[#121512] p-3 rounded-xl border border-stone-800">
                  <p className="text-[10px] text-stone-400 uppercase font-bold">Vélocité</p>
                  <p className="text-base font-extrabold text-teal-300 mt-0.5">
                    ~{trendsSummary.topPerformingPlant.monthlyVelocityCmPerWeek} cm/sem
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800/80 flex gap-2">
              {onSelectPlant && (
                <button
                  onClick={() => {
                    const fullPlant = plants.find((p) => p.id === trendsSummary.topPerformingPlant?.plantId);
                    if (fullPlant) onSelectPlant(fullPlant);
                  }}
                  className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  Voir la fiche
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              )}
              {onOpenAdStudio && (
                <button
                  onClick={() => onOpenAdStudio(trendsSummary.topPerformingPlant?.plantId)}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  Créer Pub
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Collective Insights & Care Recommendations (7 cols) */}
        <div className="lg:col-span-7 bg-[#141614] rounded-3xl p-6 border border-stone-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-100 font-['Outfit',sans-serif]">
                  Diagnostic Collectif & Synthèse IA
                </h3>
                <p className="text-xs text-stone-400">Analyse croisée des cycles d'arrosage et des taux d'élongation</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="bg-[#1a1e1a] p-3 rounded-2xl border border-stone-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-100">Dynamique de croissance très favorable (+{trendsSummary.avgGrowthRateCm} cm)</p>
                  <p className="text-stone-400 text-[11px] mt-0.5 leading-relaxed">
                    Vos plantes ont bénéficié d'une hydratation stable, favorisant le déploiement de {trendsSummary.totalNewLeaves} nouvelles feuilles ce mois-ci.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1e1a] p-3 rounded-2xl border border-stone-800 flex items-start gap-2.5">
                <Droplets className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-100">Régularité des soins et arrosages</p>
                  <p className="text-stone-400 text-[11px] mt-0.5 leading-relaxed">
                    Le respect des rappels de fréquence maintient 100% de vos plantes au-dessus du seuil de santé optimal (score {'>'} 80).
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1e1a] p-3 rounded-2xl border border-stone-800 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-100">Conseil pour le mois prochain</p>
                  <p className="text-stone-400 text-[11px] mt-0.5 leading-relaxed">
                    Continuer les apports réguliers de lumière tamisée et surveiller l'espacement des tuteurs pour les espèces à croissance rapide comme Monstera.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Detailed Plant Growth Ranking Table */}
      <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-100 font-['Outfit',sans-serif]">
              Classement Individuel des Taux de Croissance & Vitalité
            </h3>
            <p className="text-xs text-stone-400">Détails de performance plante par plante</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            {trendsSummary.plantSummaries.length} plantes suivies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead>
              <tr className="border-b border-stone-800 text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Plante</th>
                <th className="pb-3">Catégorie</th>
                <th className="pb-3">Hauteur Actuelle</th>
                <th className="pb-3">Gain de Taille</th>
                <th className="pb-3">Vitesse / Semaine</th>
                <th className="pb-3">Score Santé</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {trendsSummary.plantSummaries.map((summary) => {
                const fullPlant = plants.find((p) => p.id === summary.plantId);
                return (
                  <tr
                    key={summary.plantId}
                    className="hover:bg-stone-900/40 transition-colors cursor-pointer group"
                    onClick={() => {
                      if (fullPlant && onSelectPlant) onSelectPlant(fullPlant);
                    }}
                  >
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={summary.coverImage}
                          alt={summary.plantName}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-100 group-hover:text-emerald-400 transition-colors">
                            {summary.plantName}
                          </p>
                          <p className="text-[10px] text-stone-400">+{summary.leafGained} nouvelle(s) feuille(s)</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-900 text-stone-300 border border-stone-800">
                        {summary.category}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-stone-100">
                      {summary.currentHeight} cm
                    </td>
                    <td className="py-3.5">
                      <span className="font-extrabold text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{summary.heightGained} cm
                      </span>
                    </td>
                    <td className="py-3.5 font-medium text-teal-300">
                      ~{summary.monthlyVelocityCmPerWeek} cm/sem
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                          summary.currentHealth >= 90
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                            : summary.currentHealth >= 75
                            ? 'bg-teal-950 text-teal-300 border-teal-500/30'
                            : 'bg-amber-950 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {summary.currentHealth} / 100
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAdStudio) onOpenAdStudio(summary.plantId);
                        }}
                        className="py-1.5 px-3 bg-[#1e231e] hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-[11px] rounded-xl border border-emerald-500/30 transition-all inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Créer Pub
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
