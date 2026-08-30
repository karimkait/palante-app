import React, { useState } from 'react';
import { Plant, PlantLog, PlantDiagnosis } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { Camera, Sparkles, X, Plus, CheckCircle2, TrendingUp } from 'lucide-react';

interface AddLogModalProps {
  isOpen: boolean;
  plant: Plant;
  onClose: () => void;
  onAddLog: (plantId: string, log: PlantLog) => void;
}

export const AddLogModal: React.FC<AddLogModalProps> = ({
  isOpen,
  plant,
  onClose,
  onAddLog
}) => {
  const latestLog = plant.logs[plant.logs.length - 1];

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState<number>((latestLog?.heightCm || 20) + 2);
  const [leafCount, setLeafCount] = useState<number>((latestLog?.leafCount || 4) + 1);
  const [healthScore, setHealthScore] = useState<number>(latestLog?.healthScore || 90);
  const [stage, setStage] = useState<PlantLog['stage']>(latestLog?.stage || 'Croissance active');
  const [notes, setNotes] = useState('');
  const [actionsTaken, setActionsTaken] = useState<string[]>(['Arrosage']);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | undefined>(undefined);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);

  if (!isOpen) return null;

  const availableActions = ['Arrosage', 'Engrais', 'Rempotage', 'Brumisation', 'Taille', 'Pivoté pour le soleil'];

  const toggleAction = (action: string) => {
    setActionsTaken((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const handlePhotoCaptured = async (photo: string, triggerAiDiagnostic?: boolean) => {
    setPhotoUrl(photo);
    if (triggerAiDiagnostic) {
      runAiScan(photo);
    }
  };

  const runAiScan = async (base64Photo: string) => {
    setIsAiScanning(true);
    try {
      const res = await fetch('/api/plant/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Photo,
          plantName: plant.name,
          plantNotes: notes,
          previousLogs: plant.logs.slice(-2)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data);
        if (data.healthScore) setHealthScore(data.healthScore);
        if (data.diagnosisSummary) {
          setNotes((prev) => prev ? `${prev}\n\n[Diagnostic IA]: ${data.diagnosisSummary}` : `[Diagnostic IA]: ${data.diagnosisSummary}`);
        }
      }
    } catch (err) {
      console.error('Erreur diagnostic IA:', err);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;

    const newLog: PlantLog = {
      id: `log-${Date.now()}`,
      date: date,
      photoUrl: photoUrl,
      heightCm: heightCm,
      leafCount: leafCount,
      healthScore: healthScore,
      stage: stage,
      notes: notes,
      actionsTaken: actionsTaken,
      diagnosis: diagnosis
    };

    onAddLog(plant.id, newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#141614] rounded-3xl shadow-2xl overflow-hidden border border-stone-800 my-8 text-stone-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#181b18]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Nouvelle étape de croissance</span>
            <h3 className="font-bold text-stone-100 text-lg font-['Outfit',sans-serif]">
              {plant.name} • Journal Photo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Photo Capture Area */}
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">Photo du jour *</label>
            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-stone-950 border border-stone-800 shadow-inner">
                <img src={photoUrl} alt="Photo capturée" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => runAiScan(photoUrl)}
                    disabled={isAiScanning}
                    className="bg-emerald-950/90 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-md border border-emerald-500/30 flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiScanning ? 'animate-spin' : ''}`} />
                    {isAiScanning ? 'Analyse IA...' : 'Analyser avec l\'IA'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-md hover:bg-stone-900 border border-white/10"
                  >
                    Changer
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsCameraOpen(true)}
                className="border-2 border-dashed border-stone-800 hover:border-emerald-500/80 rounded-2xl p-6 text-center cursor-pointer bg-[#1a1e1a]/60 hover:bg-[#1e231e] transition-all space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center shadow-sm border border-emerald-500/30">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-200">Prendre la photo d'évolution</p>
                  <p className="text-xs text-stone-400">Activez la caméra ou importez depuis vos photos</p>
                </div>
              </div>
            )}
          </div>

          {/* Date & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Date de la photo</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Stade actuel</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PlantLog['stage'])}
                className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Semis" className="bg-[#141614] text-stone-200">Semis</option>
                <option value="Bouture" className="bg-[#141614] text-stone-200">Bouture</option>
                <option value="Croissance active" className="bg-[#141614] text-stone-200">Croissance active</option>
                <option value="Floraison" className="bg-[#141614] text-stone-200">Floraison</option>
                <option value="Fructification" className="bg-[#141614] text-stone-200">Fructification</option>
                <option value="Mature" className="bg-[#141614] text-stone-200">Mature</option>
              </select>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#1a1e1a] p-3.5 rounded-2xl border border-stone-800">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Hauteur (cm)</label>
              <input
                type="number"
                min="1"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-[#141614] border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 font-bold focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Nb de Feuilles</label>
              <input
                type="number"
                min="1"
                value={leafCount}
                onChange={(e) => setLeafCount(Number(e.target.value))}
                className="w-full bg-[#141614] border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 font-bold focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Score Santé (/100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={healthScore}
                onChange={(e) => setHealthScore(Number(e.target.value))}
                className="w-full bg-[#141614] border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Care Actions Badges */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">Soins & Actions réalisés</label>
            <div className="flex flex-wrap gap-2">
              {availableActions.map((act) => {
                const isSelected = actionsTaken.includes(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleAction(act)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm border border-emerald-500/40'
                        : 'bg-[#1a1e1a] text-stone-300 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    {act}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Notes & Progrès observés</label>
            <textarea
              rows={2}
              placeholder="Apparition d'une nouvelle feuille, découpes plus nettes, arrosage effectué..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* AI Diagnosis details if present */}
          {diagnosis && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 text-xs space-y-1 text-emerald-300">
              <p className="font-bold flex items-center gap-1.5 text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Bilan IA : {diagnosis.diagnosisSummary}
              </p>
              <p className="text-[11px] text-emerald-300/90">
                🌱 <strong>Progrès pointillés :</strong> {diagnosis.estimatedGrowthProgress}
              </p>
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-800 text-stone-300 font-semibold text-xs hover:bg-stone-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!photoUrl}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all border border-emerald-500/30"
            >
              Ajouter cette étape au journal
            </button>
          </div>

        </form>

        {/* Camera capture sub-modal */}
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={handlePhotoCaptured}
          title={`Prendre en photo ${plant.name}`}
        />

      </div>
    </div>
  );
};
