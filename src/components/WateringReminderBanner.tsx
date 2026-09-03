import React from 'react';
import { Plant } from '../types';
import { getAllPlantsWateringSummary } from '../utils/watering';
import { Droplets, AlertTriangle, CheckCircle2, Bell, ChevronRight, Sparkles } from 'lucide-react';

interface WateringReminderBannerProps {
  plants: Plant[];
  onOpenNotifications: () => void;
  onWaterPlant: (plantId: string) => void;
  onWaterAllDue: () => void;
  onSelectPlant: (plant: Plant) => void;
}

export const WateringReminderBanner: React.FC<WateringReminderBannerProps> = ({
  plants,
  onOpenNotifications,
  onWaterPlant,
  onWaterAllDue,
  onSelectPlant
}) => {
  const summary = getAllPlantsWateringSummary(plants);
  const { overdue, dueToday, upcoming, needsWaterCount } = summary;

  if (plants.length === 0) return null;

  // Case 1: Urgent waterings (overdue or due today)
  if (needsWaterCount > 0) {
    const urgentItems = [...overdue, ...dueToday];
    return (
      <div className="bg-gradient-to-r from-sky-950/80 via-[#131f24] to-[#141614] border border-sky-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden text-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Left info */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-950 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-sky-950/50">
              <Droplets className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Rappel d'Arrosage
                </span>
                <span className="text-xs font-bold text-sky-300">
                  {needsWaterCount} plante{needsWaterCount > 1 ? 's assoiffée(s)' : ' assoiffée'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-['Outfit',sans-serif] text-stone-100 mt-1">
                {needsWaterCount === 1
                  ? `${urgentItems[0]?.plantName} a besoin d'eau aujourd'hui !`
                  : `C'est le moment d'arroser vos plantes (${needsWaterCount})`}
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Calculé selon la fréquence d'arrosage configurée pour chaque espèce.
              </p>
            </div>
          </div>

          {/* Right quick actions & plant avatars */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Avatars of urgent plants */}
            <div className="flex items-center -space-x-2.5">
              {urgentItems.slice(0, 4).map((item) => (
                <img
                  key={item.plantId}
                  src={item.coverImage}
                  alt={item.plantName}
                  title={`${item.plantName} (${item.statusLabel})`}
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#141614] shadow-md ring-2 ring-sky-500/40"
                />
              ))}
              {urgentItems.length > 4 && (
                <div className="w-9 h-9 rounded-full bg-stone-800 border-2 border-[#141614] text-[11px] font-bold text-stone-300 flex items-center justify-center">
                  +{urgentItems.length - 4}
                </div>
              )}
            </div>

            <button
              onClick={onWaterAllDue}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-950/50 hover:shadow-lg transition-all flex items-center gap-2 border border-sky-400/30"
            >
              <Droplets className="w-4 h-4" />
              Tout arroser ({needsWaterCount})
            </button>

            <button
              onClick={onOpenNotifications}
              className="px-3.5 py-2.5 bg-[#1a1e1a] hover:bg-stone-800 text-stone-200 font-semibold text-xs rounded-xl border border-stone-800 transition-colors flex items-center gap-1.5"
            >
              <span>Détails</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Case 2: All plants are well hydrated
  return (
    <div className="bg-[#141614] border border-stone-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-stone-200 flex items-center gap-2 font-['Outfit',sans-serif]">
            <span>Arrosages à jour</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium">
              Toutes hydratées
            </span>
          </h4>
          <p className="text-xs text-stone-400">
            {upcoming.length > 0
              ? `Prochain arrosage prévu pour ${upcoming[0]?.plantName} ${upcoming[0]?.statusLabel.toLowerCase()}.`
              : 'Aucun arrosage urgent requis pour le moment.'}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenNotifications}
        className="text-xs font-semibold text-stone-400 hover:text-emerald-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1a1e1a] border border-stone-800 hover:border-emerald-500/30 transition-all shrink-0"
      >
        <Bell className="w-3.5 h-3.5 text-emerald-400" />
        <span>Planning</span>
      </button>
    </div>
  );
};
