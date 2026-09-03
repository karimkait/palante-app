import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { PlantLog } from '../types';
import { TrendingUp, Activity, Sparkles, Layers, Check } from 'lucide-react';

interface PlantGrowthChartProps {
  logs: PlantLog[];
  plantName: string;
}

export const PlantGrowthChart: React.FC<PlantGrowthChartProps> = ({ logs, plantName }) => {
  const [showHeight, setShowHeight] = useState(true);
  const [showHealth, setShowHealth] = useState(true);
  const [showLeaves, setShowLeaves] = useState(false);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sortedLogs.map((log) => {
    const d = new Date(log.date);
    return {
      date: isNaN(d.getTime())
        ? log.date
        : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      fullDate: isNaN(d.getTime())
        ? log.date
        : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      heightCm: typeof log.heightCm === 'number' ? log.heightCm : undefined,
      healthScore: typeof log.healthScore === 'number' ? log.healthScore : 90,
      leafCount: typeof log.leafCount === 'number' ? log.leafCount : undefined,
      stage: log.stage,
      notes: log.notes
    };
  });

  const initialLog = sortedLogs[0];
  const latestLog = sortedLogs[sortedLogs.length - 1];

  const initialHeight = initialLog?.heightCm ?? 0;
  const latestHeight = latestLog?.heightCm ?? 0;
  const heightGrowth = latestHeight - initialHeight;

  const initialHealth = initialLog?.healthScore ?? 90;
  const latestHealth = latestLog?.healthScore ?? 90;
  const healthDiff = latestHealth - initialHealth;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#141614] border border-stone-800 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2.5 min-w-[200px]">
          <div className="border-b border-stone-800 pb-1.5 flex items-center justify-between gap-2">
            <p className="font-bold text-stone-100">{data.fullDate}</p>
            {data.stage && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {data.stage}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {data.heightCm !== undefined && (
              <div className="flex items-center justify-between text-stone-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                  Hauteur :
                </span>
                <span className="font-bold text-stone-100">{data.heightCm} cm</span>
              </div>
            )}

            {data.healthScore !== undefined && (
              <div className="flex items-center justify-between text-stone-300">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                  Score Santé :
                </span>
                <span className="font-bold text-amber-300">{data.healthScore} / 100</span>
              </div>
            )}

            {data.leafCount !== undefined && showLeaves && (
              <div className="flex items-center justify-between text-stone-300">
                <span className="flex items-center gap-1.5 text-teal-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
                  Feuilles :
                </span>
                <span className="font-bold text-teal-200">{data.leafCount}</span>
              </div>
            )}
          </div>

          {data.notes && (
            <p className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-800/80 line-clamp-2">
              « {data.notes} »
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#141614] rounded-3xl p-6 sm:p-7 border border-stone-800 shadow-md space-y-5">
      {/* Header & Metric Highlights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-stone-100 font-['Outfit',sans-serif]">
              Évolution de la Hauteur & Vitalité
            </h3>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Suivi chronologique des mesures de croissance et des scores de santé pour {plantName}.
          </p>
        </div>

        {/* Toggle Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowHeight(!showHeight)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showHeight
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-[#1a1e1a] text-stone-500 border-stone-800 hover:text-stone-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showHeight ? 'bg-emerald-400' : 'bg-stone-600'
              }`}
            ></span>
            Hauteur (cm)
          </button>

          <button
            type="button"
            onClick={() => setShowHealth(!showHealth)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showHealth
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#1a1e1a] text-stone-500 border-stone-800 hover:text-stone-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showHealth ? 'bg-amber-400' : 'bg-stone-600'
              }`}
            ></span>
            Score Santé (/100)
          </button>

          <button
            type="button"
            onClick={() => setShowLeaves(!showLeaves)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showLeaves
                ? 'bg-teal-950/80 text-teal-300 border-teal-500/40 shadow-sm'
                : 'bg-[#1a1e1a] text-stone-500 border-stone-800 hover:text-stone-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showLeaves ? 'bg-teal-400' : 'bg-stone-600'
              }`}
            ></span>
            Feuilles
          </button>
        </div>
      </div>

      {/* Quick Trend Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800">
          <p className="text-[10px] text-stone-400 font-semibold uppercase">Croissance cumulée</p>
          <p className="text-base font-bold text-emerald-400 mt-0.5">
            {heightGrowth >= 0 ? `+${heightGrowth} cm` : `${heightGrowth} cm`}
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {initialHeight} cm → {latestHeight} cm
          </p>
        </div>

        <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800">
          <p className="text-[10px] text-stone-400 font-semibold uppercase">Tendance Santé</p>
          <p className="text-base font-bold text-amber-300 mt-0.5">
            {latestHealth} / 100
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {healthDiff >= 0 ? `+${healthDiff} pts` : `${healthDiff} pts`} vs début
          </p>
        </div>

        <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800 col-span-2 sm:col-span-1">
          <p className="text-[10px] text-stone-400 font-semibold uppercase">Mesures enregistrées</p>
          <p className="text-base font-bold text-stone-200 mt-0.5">
            {sortedLogs.length} relevé{sortedLogs.length > 1 ? 's' : ''}
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            Dernier relevé : {chartData[chartData.length - 1]?.date}
          </p>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 w-full pt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              
              {/* Left Y Axis for Height / Leaves */}
              <YAxis
                yAxisId="left"
                stroke="#10b981"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}cm`}
              />

              {/* Right Y Axis for Health Score (0-100) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#f59e0b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />

              <Tooltip content={<CustomTooltip />} />

              {showHeight && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="heightCm"
                  name="Hauteur (cm)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', stroke: '#141614', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {showHealth && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="healthScore"
                  name="Score Santé (/100)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#f59e0b', stroke: '#141614', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#fbbf24', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {showLeaves && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="leafCount"
                  name="Nb de feuilles"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#14b8a6', stroke: '#141614', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-stone-500">
            Aucune mesure disponible pour tracer le graphique.
          </div>
        )}
      </div>

      {chartData.length === 1 && (
        <p className="text-[11px] text-stone-400 text-center bg-[#1a1e1a] py-2 px-3 rounded-xl border border-stone-800">
          💡 Une seule mesure est enregistrée. Ajoutez de nouvelles photos d'évolution pour observer les courbes de croissance se tracer automatiquement.
        </p>
      )}
    </div>
  );
};
