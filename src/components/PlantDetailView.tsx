import React, { useState } from 'react';
import { Plant, PlantLog } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import {
  Camera,
  Calendar,
  Sparkles,
  Droplets,
  Sun,
  Activity,
  Layers,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';

interface PlantDetailViewProps {
  plant: Plant;
  onBack: () => void;
  onAddPhoto: (plant: Plant) => void;
  onOpenAdStudio: (plantId: string, beforeLogId?: string, afterLogId?: string) => void;
  onOpenAiDoctor: (photoUrl: string, plant: Plant) => void;
}

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plant,
  onBack,
  onAddPhoto,
  onOpenAdStudio,
  onOpenAiDoctor
}) => {
  const sortedLogs = [...plant.logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialLog = sortedLogs[0];
  const latestLog = sortedLogs[sortedLogs.length - 1];

  const [selectedBeforeLogId, setSelectedBeforeLogId] = useState<string>(initialLog?.id || '');
  const [selectedAfterLogId, setSelectedAfterLogId] = useState<string>(latestLog?.id || '');

  const beforeLog = sortedLogs.find((l) => l.id === selectedBeforeLogId) || initialLog;
  const afterLog = sortedLogs.find((l) => l.id === selectedAfterLogId) || latestLog;

  const totalGrowthHeight = latestLog && initialLog ? (latestLog.heightCm || 0) - (initialLog.heightCm || 0) : 0;
  const totalLeavesGained = latestLog && initialLog ? (latestLog.leafCount || 0) - (initialLog.leafCount || 0) : 0;
  const daysTracked = Math.max(
    1,
    Math.round((new Date(latestLog.date).getTime() - new Date(initialLog.date).getTime()) / (1000 * 3600 * 24))
  );

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation & Actions Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-300 hover:text-white font-semibold text-sm px-4 py-2 rounded-xl bg-[#141614] border border-stone-800 shadow-sm transition-all hover:bg-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux plantes
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAddPhoto(plant)}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold text-sm px-4 py-2.5 rounded-xl border border-stone-800 shadow transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            + Ajouter une photo d'évolution
          </button>

          <button
            onClick={() => onOpenAdStudio(plant.id, beforeLog?.id, afterLog?.id)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-950/40 hover:shadow-lg transition-all border border-emerald-500/30"
          >
            <Sparkles className="w-4 h-4" />
            Créer une Pub Réseaux Sociaux
          </button>
        </div>
      </div>

      {/* Plant Hero Header */}
      <div className="bg-[#141614] rounded-3xl p-6 sm:p-8 border border-stone-800/80 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Plant Avatar / Main Photo */}
          <div className="md:col-span-4 aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 shadow-md relative group">
            <img
              src={latestLog?.photoUrl || plant.coverImage}
              alt={plant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-500/30">
              Dernière photo : {formatDate(latestLog?.date || plant.dateAcquired)}
            </div>
          </div>

          {/* Plant Identity Details */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-500/30">
                {plant.category}
              </span>
              <span className="px-3 py-1 bg-[#1a1e1a] text-stone-300 font-medium text-xs rounded-xl flex items-center gap-1.5 border border-stone-800">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {plant.location}
              </span>
              <span className="px-3 py-1 bg-[#1a1e1a] text-stone-300 font-medium text-xs rounded-xl flex items-center gap-1.5 border border-stone-800">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Acquise le {formatDate(plant.dateAcquired)}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-100 font-['Outfit',sans-serif]">
                {plant.name}
              </h1>
              <p className="text-sm font-medium text-emerald-400 italic mt-0.5">
                {plant.scientificName} ({plant.species})
              </p>
            </div>

            {plant.notes && (
              <p className="text-stone-300 text-sm leading-relaxed bg-[#1a1e1a] p-3.5 rounded-2xl border border-stone-800/80">
                {plant.notes}
              </p>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800/80 text-center">
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Suivi Total</p>
                <p className="text-base font-bold text-stone-100 mt-0.5">{daysTracked} jours</p>
              </div>
              <div className="bg-emerald-950/40 rounded-2xl p-3 border border-emerald-500/30 text-center">
                <p className="text-[10px] text-emerald-400 uppercase font-semibold">Gain Hauteur</p>
                <p className="text-base font-bold text-emerald-300 mt-0.5">
                  {totalGrowthHeight > 0 ? `+${totalGrowthHeight} cm` : `${latestLog?.heightCm || 0} cm`}
                </p>
              </div>
              <div className="bg-teal-950/40 rounded-2xl p-3 border border-teal-500/30 text-center">
                <p className="text-[10px] text-teal-400 uppercase font-semibold">Nouvelles Feuilles</p>
                <p className="text-base font-bold text-teal-300 mt-0.5">
                  {totalLeavesGained > 0 ? `+${totalLeavesGained}` : `${latestLog?.leafCount || 0}`}
                </p>
              </div>
              <div className="bg-amber-950/40 rounded-2xl p-3 border border-amber-500/30 text-center">
                <p className="text-[10px] text-amber-400 uppercase font-semibold">Santé Actuelle</p>
                <p className="text-base font-bold text-amber-300 mt-0.5">
                  {latestLog?.healthScore || 90} / 100
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Interactive Before / After Slider Section */}
      {sortedLogs.length >= 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-100 font-['Outfit',sans-serif]">
                Comparateur d'Évolution Avant / Après
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm">
                Sélectionnez deux dates pour visualiser la transformation en direct.
              </p>
            </div>

            {/* Date Selectors for Comparison */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#141614] px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
                <span className="font-bold text-stone-400">Avant :</span>
                <select
                  value={selectedBeforeLogId}
                  onChange={(e) => setSelectedBeforeLogId(e.target.value)}
                  className="bg-transparent font-semibold text-stone-200 focus:outline-none"
                >
                  {sortedLogs.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#141614] text-stone-200">
                      {new Date(l.date).toLocaleDateString('fr-FR')} ({l.stage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#141614] px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
                <span className="font-bold text-emerald-400">Après :</span>
                <select
                  value={selectedAfterLogId}
                  onChange={(e) => setSelectedAfterLogId(e.target.value)}
                  className="bg-transparent font-semibold text-emerald-300 focus:outline-none"
                >
                  {sortedLogs.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#141614] text-stone-200">
                      {new Date(l.date).toLocaleDateString('fr-FR')} ({l.stage})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <BeforeAfterSlider
            plant={plant}
            beforeLog={beforeLog}
            afterLog={afterLog}
            onOpenAdStudio={() => onOpenAdStudio(plant.id, beforeLog.id, afterLog.id)}
          />
        </div>
      )}

      {/* Chronological Evolution Timeline Journal */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-stone-100 font-['Outfit',sans-serif]">
              Journal Chronologique des Photos ({plant.logs.length})
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm">
              Toutes les étapes enregistrées avec mesures de croissance et bilans de santé.
            </p>
          </div>
          <button
            onClick={() => onAddPhoto(plant)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-emerald-950/40 border border-emerald-500/30"
          >
            <Camera className="w-3.5 h-3.5" />
            + Nouvelle Photo
          </button>
        </div>

        {/* Timeline List */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 sm:before:left-8 before:w-0.5 before:bg-stone-800 before:pointer-events-none">
          {sortedLogs.map((log, index) => {
            const isLatest = index === sortedLogs.length - 1;
            const daysFromStart = Math.max(
              0,
              Math.round((new Date(log.date).getTime() - new Date(initialLog.date).getTime()) / (1000 * 3600 * 24))
            );

            return (
              <div key={log.id} className="relative pl-14 sm:pl-20">
                
                {/* Timeline Node Badge */}
                <div className={`absolute left-3.5 sm:left-5 top-6 -translate-x-1/2 w-6 h-6 rounded-full border-4 ${
                  isLatest ? 'bg-emerald-500 border-emerald-950 shadow-lg ring-4 ring-emerald-500/30' : 'bg-[#141614] border-stone-700'
                }`}></div>

                {/* Entry Card */}
                <div className="bg-[#141614] rounded-3xl p-5 sm:p-6 border border-stone-800 shadow-md space-y-4 hover:border-emerald-500/40 transition-colors">
                  
                  {/* Top Bar of Log */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-100 text-base font-['Outfit',sans-serif]">
                        {formatDate(log.date)}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300">
                        Jour {daysFromStart}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {log.stage}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenAiDoctor(log.photoUrl, plant)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/60 px-3 py-1.5 rounded-xl transition-colors border border-emerald-500/30"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Diagnostiquer IA
                      </button>

                      <button
                        onClick={() => onOpenAdStudio(plant.id, initialLog.id, log.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Publier cette étape
                      </button>
                    </div>
                  </div>

                  {/* Grid: Photo & Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                    {/* Log Photo */}
                    <div className="sm:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 shadow-inner">
                      <img
                        src={log.photoUrl}
                        alt={`Étape ${log.date}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Log Metrics & Details */}
                    <div className="sm:col-span-7 space-y-3.5">
                      
                      {/* Metric pills */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[#1a1e1a] rounded-xl p-2.5 border border-stone-800 text-center">
                          <p className="text-[10px] text-stone-400 font-semibold uppercase">Hauteur</p>
                          <p className="text-sm font-bold text-stone-100">{log.heightCm || '--'} cm</p>
                        </div>
                        <div className="bg-[#1a1e1a] rounded-xl p-2.5 border border-stone-800 text-center">
                          <p className="text-[10px] text-stone-400 font-semibold uppercase">Feuilles</p>
                          <p className="text-sm font-bold text-stone-100">{log.leafCount || '--'}</p>
                        </div>
                        <div className="bg-emerald-950/50 rounded-xl p-2.5 border border-emerald-500/30 text-center">
                          <p className="text-[10px] text-emerald-400 font-semibold uppercase">Santé</p>
                          <p className="text-sm font-bold text-emerald-300">{log.healthScore || 90} / 100</p>
                        </div>
                      </div>

                      {/* Notes */}
                      {log.notes && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 mb-1">Observations :</p>
                          <p className="text-xs text-stone-300 bg-[#1a1e1a] p-2.5 rounded-xl border border-stone-800 leading-relaxed">
                            {log.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions Taken */}
                      {log.actionsTaken && log.actionsTaken.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-stone-400 mb-1">Soins apportés :</p>
                          <div className="flex flex-wrap gap-1.5">
                            {log.actionsTaken.map((action, i) => (
                              <span
                                key={i}
                                className="text-[11px] font-medium bg-teal-950/60 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Diagnosis Insights if attached */}
                      {log.diagnosis && (
                        <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-3 text-xs space-y-1.5 text-emerald-200">
                          <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Diagnostic IA : {log.diagnosis.diagnosisSummary}
                          </p>
                          <p className="text-emerald-300/90 text-[11px]">
                            👉 <strong>Conseil clé :</strong> {log.diagnosis.nextActionRecommendation}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
