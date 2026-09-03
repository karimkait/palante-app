import React, { useState } from 'react';
import { Plant } from '../types';
import { getPlantWateringStatus } from '../utils/watering';
import { Camera, Calendar, Droplets, TrendingUp, Sparkles, ArrowUpRight, Heart, Check, Trash2, AlertTriangle } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
  onSelect: (plant: Plant) => void;
  onAddPhoto: (plant: Plant) => void;
  onCreateAd: (plant: Plant) => void;
  onWaterPlant?: (plantId: string) => void;
  onDeletePlant?: (plantId: string) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onSelect,
  onAddPhoto,
  onCreateAd,
  onWaterPlant,
  onDeletePlant
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const sortedLogs = [...plant.logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialLog = sortedLogs[0];
  const latestLog = sortedLogs[sortedLogs.length - 1];

  const heightDelta = latestLog && initialLog ? (latestLog.heightCm || 0) - (initialLog.heightCm || 0) : 0;
  const leafDelta = latestLog && initialLog ? (latestLog.leafCount || 0) - (initialLog.leafCount || 0) : 0;

  const daysSinceAcquired = Math.max(
    1,
    Math.round((Date.now() - new Date(plant.dateAcquired).getTime()) / (1000 * 3600 * 24))
  );

  const latestHealthScore = latestLog?.healthScore || 90;
  const wateringStatus = getPlantWateringStatus(plant);

  return (
    <div className="bg-[#141614] rounded-3xl overflow-hidden border border-stone-800/80 shadow-md hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col group">
      {/* Cover Image & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-950 cursor-pointer" onClick={() => onSelect(plant)}>
        <img
          src={latestLog?.photoUrl || plant.coverImage}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141614] via-black/40 to-transparent"></div>

        {/* Top Badges & Delete Action */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-black/70 backdrop-blur-md text-stone-200 border border-white/10 shadow-sm">
            {plant.category}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{latestHealthScore}/100</span>
            </div>

            {onDeletePlant && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                title="Supprimer la plante"
                className="w-7 h-7 rounded-xl bg-black/70 hover:bg-red-950 text-stone-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 flex items-center justify-center backdrop-blur-md transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
          <p className="text-xs text-emerald-400 font-medium">{plant.location}</p>
          <h3 className="text-lg font-bold font-['Outfit',sans-serif] leading-tight text-stone-100 drop-shadow-sm">
            {plant.name}
          </h3>
          <p className="text-xs text-stone-400 italic truncate">{plant.scientificName}</p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Growth & Timeline Statistics */}
        <div className="grid grid-cols-3 gap-2 bg-[#1b1e1b] rounded-2xl p-3 border border-stone-800/80 text-center">
          <div>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Suivi</p>
            <p className="text-sm font-bold text-stone-100 mt-0.5">{plant.logs.length} photos</p>
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Gain Taille</p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">
              {heightDelta > 0 ? `+${heightDelta} cm` : `${latestLog?.heightCm || '--'} cm`}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Âge</p>
            <p className="text-sm font-bold text-stone-100 mt-0.5">{daysSinceAcquired} j</p>
          </div>
        </div>

        {/* Watering Status Bar */}
        <div className="bg-[#181b18] rounded-2xl p-2.5 border border-stone-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
              wateringStatus.isOverdue 
                ? 'bg-red-950 text-red-400 border-red-500/40 animate-pulse'
                : wateringStatus.isDueToday
                ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                : 'bg-sky-950 text-sky-400 border-sky-500/30'
            }`}>
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-stone-400 uppercase font-semibold leading-tight">Arrosage ({wateringStatus.intervalDays}j)</p>
              <p className={`text-xs font-bold truncate ${
                wateringStatus.isOverdue 
                  ? 'text-red-400' 
                  : wateringStatus.isDueToday 
                  ? 'text-amber-300' 
                  : 'text-sky-300'
              }`}>
                {wateringStatus.statusLabel}
              </p>
            </div>
          </div>

          {onWaterPlant && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWaterPlant(plant.id);
              }}
              title="Marquer comme arrosée aujourd'hui"
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                wateringStatus.isOverdue || wateringStatus.isDueToday
                  ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400/40 shadow-sm'
                  : 'bg-[#1f231f] hover:bg-sky-950 text-stone-300 hover:text-sky-300 border-stone-700'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span className="text-[11px] pr-0.5">Arroser</span>
            </button>
          )}
        </div>

        {/* Latest note / stage */}
        <div className="text-xs text-stone-300 space-y-1">
          <div className="flex items-center justify-between font-medium">
            <span className="text-stone-400">Stade actuel :</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 font-semibold border border-emerald-500/30">
              {latestLog?.stage || 'Croissance active'}
            </span>
          </div>
          {latestLog?.notes && (
            <p className="text-stone-400 italic line-clamp-2 text-[11px] pt-1">
              "{latestLog.notes}"
            </p>
          )}
        </div>

        {/* Actions Footer */}
        <div className="space-y-2 pt-2 border-t border-stone-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddPhoto(plant)}
              className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold rounded-xl border border-stone-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              + Prendre Photo
            </button>
            <button
              onClick={() => onCreateAd(plant)}
              className="py-2.5 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Créer Pub
            </button>
          </div>

          <button
            onClick={() => onSelect(plant)}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 border border-emerald-500/20"
          >
            <span>Voir l'Évolution & Timeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Quick Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div 
          className="absolute inset-0 z-30 bg-black/90 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center space-y-4 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-red-950/90 text-red-400 border border-red-500/40 flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="text-base font-bold text-stone-100 font-['Outfit',sans-serif]">
              Supprimer cette plante ?
            </h4>
            <p className="text-xs text-stone-300">
              Voulez-vous retirer <strong className="text-white">"{plant.name}"</strong> et ses {plant.logs.length} photo(s) ?
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 w-full max-w-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-stone-300 bg-[#1e221e] hover:bg-stone-800 border border-stone-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
                if (onDeletePlant) {
                  onDeletePlant(plant.id);
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md border border-red-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
