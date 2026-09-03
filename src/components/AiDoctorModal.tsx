import React, { useState, useEffect } from 'react';
import { Plant, PlantDiagnosis } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { recordDiagnosticRun } from '../utils/challenges';
import {
  Sparkles,
  Camera,
  X,
  Droplets,
  Sun,
  Wind,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Activity,
  ChevronDown,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface AiDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plants?: Plant[];
  initialPhotoUrl?: string;
  initialPlant?: Plant;
  onAddAsNewPlant?: (diagnosis: PlantDiagnosis, photoUrl: string) => void;
  onSaveDiagnosisToPlant?: (plantId: string, diagnosis: PlantDiagnosis, photoUrl: string) => void;
}

export const AiDoctorModal: React.FC<AiDoctorModalProps> = ({
  isOpen,
  onClose,
  plants = [],
  initialPhotoUrl,
  initialPlant,
  onAddAsNewPlant,
  onSaveDiagnosisToPlant
}) => {
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(initialPlant || null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isArchiveSelectorOpen, setIsArchiveSelectorOpen] = useState(false);

  // When modal opens or initial props change, reset state and run diagnosis
  useEffect(() => {
    if (isOpen) {
      const targetPlant = initialPlant || null;
      setSelectedPlant(targetPlant);
      
      const targetPhoto = initialPhotoUrl || targetPlant?.logs?.[targetPlant.logs.length - 1]?.photoUrl || targetPlant?.coverImage || null;
      setPhotoUrl(targetPhoto);
      setDiagnosis(null);
      setError(null);

      if (targetPhoto) {
        runDiagnosis(targetPhoto, targetPlant);
      }
    } else {
      // Clear state when closed so subsequent opens for different plants are fresh
      setDiagnosis(null);
      setError(null);
      setPhotoUrl(null);
      setSelectedPlant(null);
    }
  }, [isOpen, initialPhotoUrl, initialPlant?.id]);

  if (!isOpen) return null;

  const runDiagnosis = async (imgBase64: string, plantTarget?: Plant | null) => {
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    const activePlant = plantTarget !== undefined ? plantTarget : selectedPlant;

    try {
      const res = await fetch('/api/plant/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgBase64,
          plantName: activePlant?.name || undefined,
          plantSpecies: activePlant?.species || undefined,
          scientificName: activePlant?.scientificName || undefined,
          category: activePlant?.category || undefined,
          plantNotes: activePlant?.notes || undefined,
          previousLogs: activePlant?.logs?.slice(-3).map((l) => ({
            date: l.date,
            heightCm: l.heightCm,
            healthScore: l.healthScore,
            notes: l.notes
          }))
        })
      });

      if (!res.ok) throw new Error('Erreur lors du diagnostic IA');
      const data = await res.json();
      setDiagnosis(data);
      recordDiagnosticRun();
    } catch (err: any) {
      console.error(err);
      setError("Impossible d'analyser la photo. Vérifiez la connexion ou réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlant = (plantId: string) => {
    if (plantId === 'new') {
      setSelectedPlant(null);
      setDiagnosis(null);
      // Keep or prompt photo
      if (photoUrl) {
        runDiagnosis(photoUrl, null);
      }
      return;
    }

    const found = plants.find((p) => p.id === plantId) || null;
    setSelectedPlant(found);
    setDiagnosis(null);

    // Pick best available photo from the newly selected plant
    const latestPhoto = found?.logs?.[found.logs.length - 1]?.photoUrl || found?.coverImage || photoUrl;
    if (latestPhoto) {
      setPhotoUrl(latestPhoto);
      runDiagnosis(latestPhoto, found);
    }
  };

  const handleSelectArchivePhoto = (url: string) => {
    setPhotoUrl(url);
    setIsArchiveSelectorOpen(false);
    runDiagnosis(url, selectedPlant);
  };

  const handlePhotoCaptured = (photo: string) => {
    setPhotoUrl(photo);
    runDiagnosis(photo, selectedPlant);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#141614] rounded-3xl shadow-2xl overflow-hidden border border-stone-800 my-8 text-stone-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#181b18] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Outfit',sans-serif] text-stone-100">
                Clinique Botanique & Diagnostic IA
              </h3>
              <p className="text-[11px] text-stone-400">Analyse de vitalité, détection d'anomalies & conseils personnalisés</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Plant Selector Bar */}
          {plants.length > 0 && (
            <div className="bg-[#1a1e1a] rounded-2xl p-3.5 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-300 whitespace-nowrap">Plante à diagnostiquer :</span>
                <select
                  value={selectedPlant?.id || 'new'}
                  onChange={(e) => handleSelectPlant(e.target.value)}
                  className="bg-[#121412] text-emerald-400 text-xs font-bold rounded-xl px-3 py-1.5 border border-stone-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="new">✨ Nouvelle plante / Détection auto</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      🪴 {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlant && selectedPlant.logs.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsArchiveSelectorOpen(!isArchiveSelectorOpen)}
                  className="flex items-center gap-1.5 text-[11px] text-stone-300 hover:text-teal-300 bg-[#121412] px-2.5 py-1.5 rounded-xl border border-stone-700/80 hover:border-teal-500/40 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                  <span>Choisir parmi ses {selectedPlant.logs.length} photos</span>
                </button>
              )}
            </div>
          )}

          {/* Archive Photos Drawer */}
          {isArchiveSelectorOpen && selectedPlant && (
            <div className="bg-[#111612] rounded-2xl p-3 border border-teal-500/30 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-300">
                  Sélectionnez une photo d'archive de {selectedPlant.name} :
                </span>
                <button
                  onClick={() => setIsArchiveSelectorOpen(false)}
                  className="text-stone-400 hover:text-stone-200 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                {selectedPlant.logs.map((log, idx) => (
                  <button
                    key={log.id}
                    onClick={() => handleSelectArchivePhoto(log.photoUrl)}
                    className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                      photoUrl === log.photoUrl
                        ? 'border-teal-400 ring-2 ring-teal-400/30 scale-105'
                        : 'border-stone-800 hover:border-teal-500/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={log.photoUrl} alt={`Archive ${log.date}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-stone-200 text-center py-0.5 truncate px-1">
                      {log.date}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Photo area */}
          {!photoUrl ? (
            <div
              onClick={() => setIsCameraOpen(true)}
              className="border-2 border-dashed border-stone-800 hover:border-emerald-500/80 rounded-3xl p-8 text-center cursor-pointer bg-[#1a1e1a]/60 hover:bg-[#1e231e] transition-all space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center shadow-sm border border-emerald-500/30">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-100">
                  {selectedPlant ? `Photographiez ${selectedPlant.name}` : 'Photographiez la plante à diagnostiquer'}
                </h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                  Feuilles jaunes, taches, arrêt de croissance ou simple check-up : l'IA analyse l'image et prescrit les soins optimaux.
                </p>
              </div>
              <button
                type="button"
                className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 hover:bg-emerald-500 border border-emerald-500/30"
              >
                Prendre ou Importer une Photo
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Photo & Main Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                
                <div className="sm:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-950 shadow-md border border-stone-800 group">
                  <img src={photoUrl} alt="Plante diagnostiquée" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="bg-black/80 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-1 shadow-md"
                    >
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>Nouvelle photo</span>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-3">
                  {isLoading ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs font-bold text-stone-200">Diagnostic botanique en cours...</p>
                      <p className="text-[11px] text-stone-400">
                        {selectedPlant ? `Analyse spécifique pour ${selectedPlant.name}...` : "Identification de l'espèce et analyse du feuillage..."}
                      </p>
                    </div>
                  ) : error ? (
                    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs space-y-2">
                      <p className="font-bold flex items-center gap-1.5 text-red-300">
                        <AlertCircle className="w-4 h-4" /> {error}
                      </p>
                      <button
                        onClick={() => photoUrl && runDiagnosis(photoUrl, selectedPlant)}
                        className="px-3 py-1.5 bg-red-900/60 hover:bg-red-900 rounded-lg text-white font-semibold text-[11px] flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Réessayer
                      </button>
                    </div>
                  ) : diagnosis ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            {diagnosis.growthStage}
                          </span>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            Score : {diagnosis.healthScore}/100
                          </span>
                        </div>
                        <h4 className="text-xl font-extrabold text-stone-100 font-['Outfit',sans-serif] mt-0.5">
                          {selectedPlant ? selectedPlant.name : diagnosis.speciesName}
                        </h4>
                        <p className="text-xs text-stone-400 italic">
                          {diagnosis.scientificName} {selectedPlant && `(${diagnosis.speciesName})`}
                        </p>
                      </div>

                      <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                        <strong className="text-stone-100">Bilan :</strong> {diagnosis.diagnosisSummary}
                      </div>

                      <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-amber-300">
                          <Activity className="w-3.5 h-3.5 text-amber-400" /> Action prioritaire recommandée :
                        </p>
                        <p className="text-[11px] text-amber-200/90">{diagnosis.nextActionRecommendation}</p>
                      </div>
                    </>
                  ) : null}
                </div>

              </div>

              {/* Detailed Care Protocol */}
              {diagnosis && !isLoading && (
                <div className="space-y-4 pt-2 border-t border-stone-800">
                  <h5 className="font-bold text-stone-100 text-sm font-['Outfit',sans-serif]">
                    Guide de Soins & Traitement Recommandé
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                        <Droplets className="w-3.5 h-3.5" /> Arrosage
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {diagnosis.careAdvice.watering}
                      </p>
                    </div>

                    <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Sun className="w-3.5 h-3.5" /> Exposition
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {diagnosis.careAdvice.sunlight}
                      </p>
                    </div>

                    <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Layers className="w-3.5 h-3.5" /> Terreau & Engrais
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {diagnosis.careAdvice.soilAndFertilizer}
                      </p>
                    </div>
                  </div>

                  {/* Issues or positive signs list */}
                  {diagnosis.issuesIdentified && diagnosis.issuesIdentified.length > 0 && (
                    <div className="bg-emerald-950/40 rounded-2xl p-3.5 border border-emerald-500/30 space-y-1.5">
                      <p className="text-xs font-bold text-emerald-300">Observations remarquables :</p>
                      <ul className="space-y-1">
                        {diagnosis.issuesIdentified.map((issue, idx) => (
                          <li key={idx} className="text-[11px] text-emerald-200 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Action: Add as new plant or Close */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 px-4 rounded-xl border border-stone-800 text-stone-300 font-semibold text-xs hover:bg-stone-900 transition-colors"
                    >
                      Fermer
                    </button>

                    {selectedPlant && onSaveDiagnosisToPlant && (
                      <button
                        onClick={() => {
                          if (selectedPlant && photoUrl) {
                            onSaveDiagnosisToPlant(selectedPlant.id, diagnosis, photoUrl);
                            onClose();
                          }
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-950/40 transition-all flex items-center justify-center gap-2 border border-teal-500/30"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Enregistrer au journal de {selectedPlant.name}
                      </button>
                    )}

                    {!selectedPlant && onAddAsNewPlant && (
                      <button
                        onClick={() => {
                          if (photoUrl) {
                            onAddAsNewPlant(diagnosis, photoUrl);
                            onClose();
                          }
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 border border-emerald-500/30"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter cette plante à mon jardin
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Camera capture sub-modal */}
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={handlePhotoCaptured}
          title={selectedPlant ? `Photographier ${selectedPlant.name}` : "Photographier pour diagnostic IA"}
        />

      </div>
    </div>
  );
};

