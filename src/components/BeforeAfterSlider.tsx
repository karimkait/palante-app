import React, { useState, useRef } from 'react';
import { PlantLog, Plant } from '../types';
import { Calendar, ArrowRight, Share2, Sparkles, TrendingUp, Layers } from 'lucide-react';

interface BeforeAfterSliderProps {
  plant: Plant;
  beforeLog: PlantLog;
  afterLog: PlantLog;
  onOpenAdStudio?: (beforeLogId: string, afterLogId: string) => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  plant,
  beforeLog,
  afterLog,
  onOpenAdStudio
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const daysDifference = Math.max(
    1,
    Math.round(
      (new Date(afterLog.date).getTime() - new Date(beforeLog.date).getTime()) / (1000 * 3600 * 24)
    )
  );

  const heightDelta = (afterLog.heightCm || 0) - (beforeLog.heightCm || 0);
  const leavesDelta = (afterLog.leafCount || 0) - (beforeLog.leafCount || 0);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800/80 shadow-lg space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <Layers className="w-3.5 h-3.5" /> Comparateur Avant / Après
            </span>
            <span className="text-xs text-stone-400 font-medium">
              Évolution sur {daysDifference} jours
            </span>
          </div>
          <h3 className="text-xl font-bold text-stone-100 mt-1 font-['Outfit',sans-serif]">
            {plant.name} : Transformation visible
          </h3>
        </div>

        {onOpenAdStudio && (
          <button
            onClick={() => onOpenAdStudio(beforeLog.id, afterLog.id)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-950/40 hover:shadow-lg transition-all border border-emerald-500/30"
          >
            <Sparkles className="w-4 h-4" />
            Créer une Pub Réseaux Sociaux
          </button>
        )}
      </div>

      {/* Evolution Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1a1e1a] rounded-2xl p-3.5 border border-stone-800/80">
          <p className="text-xs text-stone-400 font-medium">Durée totale</p>
          <p className="text-lg font-bold text-stone-100 mt-0.5">{daysDifference} jours</p>
        </div>
        <div className="bg-emerald-950/40 rounded-2xl p-3.5 border border-emerald-500/30">
          <p className="text-xs text-emerald-400 font-medium">Gain de Hauteur</p>
          <p className="text-lg font-bold text-emerald-300 mt-0.5">
            {heightDelta > 0 ? `+${heightDelta} cm` : `${afterLog.heightCm || '--'} cm`}
          </p>
        </div>
        <div className="bg-teal-950/40 rounded-2xl p-3.5 border border-teal-500/30">
          <p className="text-xs text-teal-400 font-medium">Nouvelles Feuilles</p>
          <p className="text-lg font-bold text-teal-300 mt-0.5">
            {leavesDelta > 0 ? `+${leavesDelta} feuilles` : `${afterLog.leafCount || '--'} feuilles`}
          </p>
        </div>
        <div className="bg-amber-950/40 rounded-2xl p-3.5 border border-amber-500/30">
          <p className="text-xs text-amber-400 font-medium">Santé actuelle</p>
          <p className="text-lg font-bold text-amber-300 mt-0.5">
            {afterLog.healthScore || 90} / 100
          </p>
        </div>
      </div>

      {/* Interactive Visual Slider */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-stone-800 shadow-2xl bg-stone-950"
      >
        {/* After Image (Background full) */}
        <img
          src={afterLog.photoUrl}
          alt="Après"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before Image (Clipped Left Side) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeLog.photoUrl}
            alt="Avant"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: containerRef.current?.clientWidth || '100%',
              maxWidth: 'none'
            }}
            draggable={false}
          />
        </div>

        {/* Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-10 cursor-ew-resize flex items-center justify-center -translate-x-1/2"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-10 h-10 rounded-full bg-[#141614] text-stone-100 shadow-2xl flex items-center justify-center font-bold text-sm border-2 border-emerald-400 transition-transform hover:scale-110 active:scale-95">
            ⇆
          </div>
        </div>

        {/* Floating Date & Stage Badges */}
        <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md text-stone-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>AVANT ({formatDate(beforeLog.date)})</span>
        </div>

        <div className="absolute top-4 right-4 z-20 bg-emerald-950/90 backdrop-blur-md text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 border border-emerald-400/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>APRÈS ({formatDate(afterLog.date)})</span>
        </div>

        {/* Bottom Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md text-stone-300 text-xs px-3.5 py-1 rounded-full pointer-events-none border border-white/10">
          Glissez pour révéler la métamorphose
        </div>
      </div>

      {/* Stage Progression Flow */}
      <div className="flex items-center justify-between text-xs font-medium text-stone-300 bg-[#1a1e1a] p-3 rounded-2xl border border-stone-800/80">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-400">Stade initial :</span>
          <span className="px-2 py-0.5 bg-stone-800 rounded-md text-stone-200 border border-stone-700">
            {beforeLog.stage}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-400" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-300">Stade actuel :</span>
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-semibold rounded-md border border-emerald-500/30">
            {afterLog.stage}
          </span>
        </div>
      </div>
    </div>
  );
};
