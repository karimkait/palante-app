import React, { useState, useEffect } from 'react';
import { Plant, PlantLog, ComparativeDiagnosis } from '../types';
import { recordDiagnosticRun } from '../utils/challenges';
import {
  Sparkles,
  X,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  Leaf,
  Clock,
  Droplets,
  Sun,
  ShieldCheck,
  Check,
  RefreshCw,
  Share2,
  Eye,
  Sliders,
  ChevronRight,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ComparativeDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: Plant;
  onOpenAdStudio?: (plantId: string, beforeLogId?: string, afterLogId?: string) => void;
}

export const ComparativeDiagnosisModal: React.FC<ComparativeDiagnosisModalProps> = ({
  isOpen,
  onClose,
  plant,
  onOpenAdStudio
}) => {
  // Sort logs chronologically
  const sortedLogs = [...plant.logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Selected logs state (IDs)
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ComparativeDiagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'roadmap'>('overview');

  // Initialize selected logs on open
  useEffect(() => {
    if (isOpen) {
      if (sortedLogs.length >= 2) {
        // Select all logs by default or first + last if many
        if (sortedLogs.length <= 5) {
          setSelectedLogIds(sortedLogs.map((l) => l.id));
        } else {
          // Select first, middle, and last
          const midIndex = Math.floor(sortedLogs.length / 2);
          setSelectedLogIds([sortedLogs[0].id, sortedLogs[midIndex].id, sortedLogs[sortedLogs.length - 1].id]);
        }
      } else {
        setSelectedLogIds(sortedLogs.map((l) => l.id));
      }
      setAnalysisResult(null);
      setError(null);
      setActiveTab('overview');
    }
  }, [isOpen, plant.id]);

  if (!isOpen) return null;

  const toggleLogSelection = (logId: string) => {
    if (selectedLogIds.includes(logId)) {
      if (selectedLogIds.length <= 2) {
        // Alert minimal 2 photos needed
        return;
      }
      setSelectedLogIds(selectedLogIds.filter((id) => id !== logId));
    } else {
      setSelectedLogIds([...selectedLogIds, logId]);
    }
  };

  const handleSelectAll = () => {
    setSelectedLogIds(sortedLogs.map((l) => l.id));
  };

  const handleSelectFirstAndLast = () => {
    if (sortedLogs.length >= 2) {
      setSelectedLogIds([sortedLogs[0].id, sortedLogs[sortedLogs.length - 1].id]);
    }
  };

  const handleSelectKeyMilestones = () => {
    if (sortedLogs.length <= 3) {
      setSelectedLogIds(sortedLogs.map((l) => l.id));
    } else {
      const step = Math.floor(sortedLogs.length / 3);
      const chosen = [
        sortedLogs[0].id,
        sortedLogs[step].id,
        sortedLogs[Math.min(sortedLogs.length - 1, step * 2)].id,
        sortedLogs[sortedLogs.length - 1].id
      ];
      setSelectedLogIds(Array.from(new Set(chosen)));
    }
  };

  // Convert selected logs to payload
  const runComparativeDiagnosis = async () => {
    const selectedLogs = sortedLogs.filter((l) => selectedLogIds.includes(l.id));
    if (selectedLogs.length < 2) {
      setError("Veuillez sélectionner au moins 2 photos d'archives pour effectuer une analyse comparative.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const photosPayload = selectedLogs.map((log) => ({
        imageBase64: log.photoUrl,
        date: log.date,
        heightCm: log.heightCm,
        leafCount: log.leafCount,
        stage: log.stage,
        notes: log.notes
      }));

      const res = await fetch('/api/plant/comparative-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photosPayload,
          plantName: plant.name,
          scientificName: plant.scientificName,
          category: plant.category,
          wateringIntervalDays: plant.wateringIntervalDays
        })
      });

      if (!res.ok) {
        throw new Error("Échec de l'analyse comparative");
      }

      const data: ComparativeDiagnosis = await res.json();
      setAnalysisResult(data);
      recordDiagnosticRun();

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error(err);
      setError("Impossible d'effectuer l'analyse comparative. Vérifiez votre connexion et réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLogs = sortedLogs.filter((l) => selectedLogIds.includes(l.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#141614] rounded-3xl shadow-2xl overflow-hidden border border-stone-800 my-6 text-stone-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#181b18] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md border border-emerald-400/40">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg font-['Outfit',sans-serif] text-stone-100">
                  Diagnostic Différé & Analyse Comparative
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Multi-Photos IA
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Évaluation globale de la progression de <strong>{plant.name}</strong> sur une série chronologique
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: PHOTO ARCHIVE SELECTOR */}
          <div className="bg-[#181d18] rounded-2xl p-5 border border-stone-800/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  1. Sélection des Photos d'Archives ({selectedLogIds.length} sélectionnée{selectedLogIds.length > 1 ? 's' : ''} sur {sortedLogs.length})
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Choisissez au moins 2 dates clés pour reconstituer la trajectoire de santé de la plante.
                </p>
              </div>

              {/* Quick Select Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#131613] hover:bg-stone-800 text-stone-300 border border-stone-700 transition-colors"
                >
                  Toutes ({sortedLogs.length})
                </button>
                <button
                  type="button"
                  onClick={handleSelectFirstAndLast}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#131613] hover:bg-stone-800 text-stone-300 border border-stone-700 transition-colors"
                >
                  Début / Fin
                </button>
                {sortedLogs.length >= 3 && (
                  <button
                    type="button"
                    onClick={handleSelectKeyMilestones}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#131613] hover:bg-stone-800 text-stone-300 border border-stone-700 transition-colors"
                  >
                    Jalons Clés
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnails grid selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {sortedLogs.map((log, index) => {
                const isSelected = selectedLogIds.includes(log.id);
                return (
                  <div
                    key={log.id}
                    onClick={() => toggleLogSelection(log.id)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg scale-[1.02]'
                        : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-stone-950 relative">
                      <img
                        src={log.photoUrl}
                        alt={`Étape ${log.date}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Selection Checkbox Pill */}
                      <div className="absolute top-2 right-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-black/60 border-white/40 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      {/* Photo Index Badge */}
                      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold text-stone-200 border border-white/10">
                        #{index + 1}
                      </div>
                    </div>

                    <div className="p-2 bg-[#121612] text-left">
                      <p className="text-[11px] font-bold text-stone-200 truncate">{log.date}</p>
                      <p className="text-[10px] text-stone-400 flex items-center justify-between">
                        <span>{log.stage}</span>
                        {log.heightCm && <span className="text-emerald-400 font-semibold">{log.heightCm}cm</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Diagnostic Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-stone-400">
                {selectedLogIds.length < 2
                  ? "⚠️ Sélectionnez au moins 2 photos d'archives pour continuer."
                  : `✓ Prêt pour l'analyse comparative de ${selectedLogIds.length} étapes.`}
              </span>

              <button
                type="button"
                onClick={runComparativeDiagnosis}
                disabled={isLoading || selectedLogIds.length < 2}
                className={`py-3 px-6 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isLoading || selectedLogIds.length < 2
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/60 hover:shadow-xl border border-emerald-400/40 cursor-pointer active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Analyse comparative IA en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Lancer le Diagnostic Différé ({selectedLogIds.length} photos)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* STEP 2: COMPARATIVE DIAGNOSIS REPORT */}
          {analysisResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Hero Banner: Global Evolution Synthesis */}
              <div className="bg-gradient-to-br from-[#182a1b] via-[#121c14] to-[#0e1410] rounded-3xl p-6 sm:p-7 border border-emerald-500/50 shadow-xl space-y-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 inline-block mb-1">
                      Synthèse Botanique Globale
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-100 font-['Outfit',sans-serif]">
                      {analysisResult.globalTrend}
                    </h3>
                    <p className="text-xs text-stone-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {analysisResult.timeframeCovered}
                    </p>
                  </div>

                  {/* Vitality Score Comparison Pill */}
                  <div className="bg-[#121812]/90 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] text-stone-400 font-semibold uppercase">Départ</p>
                      <p className="text-xl font-bold text-stone-300">{analysisResult.vitalityEvolutionScore.startScore}</p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-emerald-400" />

                    <div className="text-center">
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase">Arrivée</p>
                      <p className="text-2xl font-extrabold text-emerald-300">{analysisResult.vitalityEvolutionScore.endScore}</p>
                    </div>

                    <div className="pl-2 border-l border-stone-800 text-center">
                      <p className="text-[10px] text-stone-400 font-semibold uppercase">Gain</p>
                      <p className={`text-base font-black ${analysisResult.vitalityEvolutionScore.delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {analysisResult.vitalityEvolutionScore.delta >= 0 ? `+${analysisResult.vitalityEvolutionScore.delta}` : analysisResult.vitalityEvolutionScore.delta} pts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Growth Velocity Summary */}
                <div className="bg-[#141a14]/80 rounded-2xl p-4 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                  <strong className="text-emerald-300 flex items-center gap-1.5 mb-1 text-xs">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Vitesse & Dynamique de Croissance :
                  </strong>
                  {analysisResult.growthVelocitySummary}
                </div>

                {/* Sub-tabs within Report */}
                <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/20">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'overview'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#141a14] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Analyse Approfondie & Jalons
                  </button>
                  <button
                    onClick={() => setActiveTab('stages')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'stages'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#141a14] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Évolution Étape par Étape ({analysisResult.stageProgression?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'roadmap'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-[#141a14] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Feuille de Route & Pronostic
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW & MILESTONES */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* In-depth Comparative Analysis */}
                  <div className="bg-[#181d18] rounded-2xl p-5 border border-stone-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-400" />
                      Rapport Comparatif d'Évolution Physiologique
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed bg-[#121612] p-4 rounded-xl border border-stone-800/80">
                      {analysisResult.comparativeAnalysis}
                    </p>
                  </div>

                  {/* 2-Column: Milestones vs Stress Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Positive Milestones */}
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-2 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Jalons Positifs & Succès Constatés
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.identifiedMilestones.map((milestone, i) => (
                          <li key={i} className="text-xs text-emerald-200 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Stress Factors & Anomaly History */}
                    <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Facteurs de Stress ou Points d'Attention
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.stressFactorsDetected && analysisResult.stressFactorsDetected.length > 0 ? (
                          analysisResult.stressFactorsDetected.map((stress, i) => (
                            <li key={i} className="text-xs text-amber-200 flex items-start gap-2">
                              <span className="text-amber-400 font-bold mt-0.5">•</span>
                              <span>{stress}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-stone-400 italic">
                            Aucun facteur de stress majeur détecté sur cette séquence chronologique.
                          </li>
                        )}
                      </ul>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: STAGES PROGRESSION */}
              {activeTab === 'stages' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.stageProgression.map((stage, idx) => {
                      const matchedLog = selectedLogs[idx];
                      return (
                        <div key={idx} className="bg-[#181d18] rounded-2xl p-4 border border-stone-800 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            {matchedLog && (
                              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-950 shadow-inner relative">
                                <img
                                  src={matchedLog.photoUrl}
                                  alt={`Étape ${stage.date}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-stone-200">
                                  Étape #{stage.photoIndex}
                                </div>
                                <div className="absolute bottom-2 right-2 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  Score : {stage.vitalityScore}/100
                                </div>
                              </div>
                            )}

                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-stone-200">{stage.date}</span>
                                <span className="text-[10px] text-emerald-400 font-semibold">{stage.stageName}</span>
                              </div>
                              <p className="text-[11px] text-stone-400 mt-1">
                                <strong>Chlorophylle :</strong> {stage.chlorophyllHealth}
                              </p>
                            </div>

                            <p className="text-xs text-stone-300 bg-[#121612] p-2.5 rounded-xl border border-stone-800/80 leading-relaxed">
                              {stage.keyObservations}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ROADMAP & PROGNOSIS */}
              {activeTab === 'roadmap' && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Long-term forecast */}
                  <div className="bg-[#181d18] rounded-2xl p-5 border border-stone-800 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Pronostic & Prévisions d'Évolution (30 à 60 jours)
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed bg-[#121612] p-4 rounded-xl border border-stone-800/80">
                      {analysisResult.longTermForecast}
                    </p>
                  </div>

                  {/* 3-Step Action Roadmap */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    
                    <div className="bg-[#181d18] rounded-2xl p-4 border border-stone-800 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-950 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs font-black">
                        1
                      </div>
                      <h5 className="text-xs font-bold text-stone-100">Action Immédiate</h5>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {analysisResult.tailoredCareRoadmap.immediate}
                      </p>
                    </div>

                    <div className="bg-[#181d18] rounded-2xl p-4 border border-stone-800 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-teal-950 text-teal-300 border border-teal-500/30 flex items-center justify-center text-xs font-black">
                        2
                      </div>
                      <h5 className="text-xs font-bold text-stone-100">Mois Prochain</h5>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {analysisResult.tailoredCareRoadmap.nextMonth}
                      </p>
                    </div>

                    <div className="bg-[#181d18] rounded-2xl p-4 border border-stone-800 space-y-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xs font-black">
                        3
                      </div>
                      <h5 className="text-xs font-bold text-stone-100">Ajustement Saisonnier</h5>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {analysisResult.tailoredCareRoadmap.seasonalAdjustment}
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1a1e1a] text-stone-300 hover:text-white border border-stone-800 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer le Bilan</span>
                  </button>

                  {onOpenAdStudio && selectedLogs.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdStudio(plant.id, selectedLogs[0].id, selectedLogs[selectedLogs.length - 1].id);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Créer une Story / Pub de cette évolution</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                >
                  Fermer & Terminer
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
