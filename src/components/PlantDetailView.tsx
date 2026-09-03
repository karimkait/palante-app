import React, { useState } from 'react';
import { Plant, PlantLog } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { PlantGrowthChart } from './PlantGrowthChart';
import { FertilizerCalculator } from './FertilizerCalculator';
import { ComparativeDiagnosisModal } from './ComparativeDiagnosisModal';
import { getPlantWateringStatus } from '../utils/watering';
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
  Tag,
  Check,
  Trash2,
  X
} from 'lucide-react';

interface PlantDetailViewProps {
  plant: Plant;
  onBack: () => void;
  onAddPhoto: (plant: Plant) => void;
  onOpenAdStudio: (plantId: string, beforeLogId?: string, afterLogId?: string) => void;
  onOpenAiDoctor: (photoUrl: string, plant: Plant) => void;
  onWaterPlant?: (plantId: string) => void;
  onUpdateWateringInterval?: (plantId: string, days: number) => void;
  onDeletePlant?: (plantId: string) => void;
}

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plant,
  onBack,
  onAddPhoto,
  onOpenAdStudio,
  onOpenAiDoctor,
  onWaterPlant,
  onUpdateWateringInterval,
  onDeletePlant
}) => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isComparativeModalOpen, setIsComparativeModalOpen] = useState(false);
  const sortedLogs = [...plant.logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialLog = sortedLogs[0];
  const latestLog = sortedLogs[sortedLogs.length - 1];

  const [selectedBeforeLogId, setSelectedBeforeLogId] = useState<string>(initialLog?.id || '');
  const [selectedAfterLogId, setSelectedAfterLogId] = useState<string>(latestLog?.id || '');
  const [editingInterval, setEditingInterval] = useState(false);
  const [tempInterval, setTempInterval] = useState(plant.wateringIntervalDays || 7);

  const beforeLog = sortedLogs.find((l) => l.id === selectedBeforeLogId) || initialLog;
  const afterLog = sortedLogs.find((l) => l.id === selectedAfterLogId) || latestLog;

  const totalGrowthHeight = latestLog && initialLog ? (latestLog.heightCm || 0) - (initialLog.heightCm || 0) : 0;
  const totalLeavesGained = latestLog && initialLog ? (latestLog.leafCount || 0) - (initialLog.leafCount || 0) : 0;
  const daysTracked = Math.max(
    1,
    Math.round((new Date(latestLog.date).getTime() - new Date(initialLog.date).getTime()) / (1000 * 3600 * 24))
  );

  const wateringStatus = getPlantWateringStatus(plant);

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

  const handleSaveInterval = () => {
    if (onUpdateWateringInterval && tempInterval > 0) {
      onUpdateWateringInterval(plant.id, tempInterval);
    }
    setEditingInterval(false);
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
          {plant.logs.length >= 2 && (
            <button
              onClick={() => setIsComparativeModalOpen(true)}
              title="Lancer une analyse comparative de plusieurs photos d'archives"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-950 to-emerald-950 hover:from-teal-900 hover:to-emerald-900 text-teal-300 hover:text-teal-200 font-bold text-sm px-4 py-2.5 rounded-xl border border-teal-500/40 shadow transition-all"
            >
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Diagnostic Différé IA</span>
            </button>
          )}

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

          {onDeletePlant && (
            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              title="Supprimer cette plante du jardin"
              className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-semibold text-sm px-3.5 py-2.5 rounded-xl border border-red-500/30 shadow transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          )}
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

            {/* Watering Care & Reminders Bar */}
            <div className="bg-[#181b18] p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  wateringStatus.isOverdue
                    ? 'bg-red-950 text-red-400 border-red-500/40 animate-pulse'
                    : wateringStatus.isDueToday
                    ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                    : 'bg-sky-950 text-sky-400 border-sky-500/30'
                }`}>
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-200">Programme d'arrosage :</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${wateringStatus.badgeColor}`}>
                      {wateringStatus.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Dernier arrosage : {formatDate(wateringStatus.lastWateredDate)} • Fréquence : tous les {wateringStatus.intervalDays} jours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingInterval ? (
                  <div className="flex items-center gap-1.5 bg-[#141614] p-1 rounded-xl border border-stone-700">
                    <span className="text-[11px] text-stone-400 pl-2">Tous les</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={tempInterval}
                      onChange={(e) => setTempInterval(Number(e.target.value))}
                      className="w-14 bg-[#1a1e1a] border border-stone-800 rounded-lg px-2 py-1 text-xs text-center text-stone-100 focus:outline-none"
                    />
                    <span className="text-[11px] text-stone-400">j</span>
                    <button
                      onClick={handleSaveInterval}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingInterval(true)}
                    className="px-3 py-2 bg-[#1a1e1a] hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl border border-stone-800 transition-colors"
                  >
                    Modifier fréquence
                  </button>
                )}

                {onWaterPlant && (
                  <button
                    onClick={() => onWaterPlant(plant.id)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-950/40 transition-all flex items-center gap-1.5 border border-sky-400/30"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Arroser aujourd'hui</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Growth & Health Score Curve (Recharts) */}
      <PlantGrowthChart logs={plant.logs} plantName={plant.name} />

      {/* Fertilizer & Nutrient Dosage Calculator */}
      <FertilizerCalculator plant={plant} />

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-stone-100 font-['Outfit',sans-serif]">
              Journal Chronologique des Photos ({plant.logs.length})
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm">
              Toutes les étapes enregistrées avec mesures de croissance et bilans de santé.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {plant.logs.length >= 2 && (
              <button
                onClick={() => setIsComparativeModalOpen(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-teal-900/80 to-emerald-900/80 hover:from-teal-800 hover:to-emerald-800 text-teal-200 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md border border-teal-500/30 transition-all"
              >
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Diagnostic Différé Multi-Photos</span>
              </button>
            )}
            <button
              onClick={() => onAddPhoto(plant)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-emerald-950/40 border border-emerald-500/30"
            >
              <Camera className="w-3.5 h-3.5" />
              + Nouvelle Photo
            </button>
          </div>
        </div>

        {/* Comparative Diagnosis Callout Card */}
        {plant.logs.length >= 2 && (
          <div className="bg-gradient-to-r from-[#142318] via-[#121c15] to-[#121915] rounded-3xl p-5 border border-teal-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-950 border border-teal-400/40 text-teal-400 flex items-center justify-center shrink-0 shadow-md">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-stone-100 font-['Outfit',sans-serif] flex items-center gap-2">
                  <span>Diagnostic Différé IA disponible</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 font-extrabold border border-teal-500/30">
                    {plant.logs.length} photos archivées
                  </span>
                </h4>
                <p className="text-xs text-stone-300">
                  Comparez plusieurs photos d'archives pour mesurer la vitesse de croissance, l'évolution de la vitalité et recevoir une feuille de route personnalisée.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsComparativeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-950/60 border border-teal-400/40 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lancer le Bilan Comparatif</span>
            </button>
          </div>
        )}

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

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161a16] border border-red-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-100 font-['Outfit',sans-serif]">
                  Supprimer cette plante ?
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Êtes-vous sûr de vouloir retirer <strong className="text-white">"{plant.name}"</strong> de votre jardin ?
                </p>
              </div>
            </div>

            <div className="bg-[#121512] rounded-2xl p-3.5 border border-stone-800/80 text-xs text-stone-400 space-y-1.5">
              <p className="text-red-400/90 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Attention : Cette action est irréversible.
              </p>
              <p className="text-[11px] text-stone-400">
                L'ensemble de son historique comprenant <strong>{plant.logs.length} photo(s) d'évolution</strong>, ses données de croissance et ses rappels d'arrosage seront définitivement effacés.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-[#1a1e1a] hover:bg-stone-800 border border-stone-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmDeleteOpen(false);
                  if (onDeletePlant) {
                    onDeletePlant(plant.id);
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-950/50 border border-red-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Comparative Multi-Photo Diagnosis Modal */}
      <ComparativeDiagnosisModal
        isOpen={isComparativeModalOpen}
        onClose={() => setIsComparativeModalOpen(false)}
        plant={plant}
        onOpenAdStudio={onOpenAdStudio}
      />
    </div>
  );
};
