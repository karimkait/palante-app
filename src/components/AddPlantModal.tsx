import React, { useState } from 'react';
import { Plant, PlantLog } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { Camera, Sparkles, X, Plus, Upload, Droplets, MapPin, Tag } from 'lucide-react';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (newPlant: Plant) => void;
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onAddPlant
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState<Plant['category']>('Interieur');
  const [location, setLocation] = useState('Salon');
  const [wateringDays, setWateringDays] = useState(7);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [initialHeight, setInitialHeight] = useState<number>(20);
  const [initialLeaves, setInitialLeaves] = useState<number>(4);
  const [stage, setStage] = useState<PlantLog['stage']>('Bouture');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);

  if (!isOpen) return null;

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
          plantName: name || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.speciesName && !name) setName(data.speciesName);
        if (data.speciesName) setSpecies(data.speciesName);
        if (data.scientificName) setScientificName(data.scientificName);
        if (data.growthStage) {
          if (data.growthStage.toLowerCase().includes('bouture')) setStage('Bouture');
          else if (data.growthStage.toLowerCase().includes('semis')) setStage('Semis');
          else setStage('Croissance active');
        }
        if (data.diagnosisSummary) {
          setNotes((prev) => prev ? `${prev}\n\n[Diagnostic IA]: ${data.diagnosisSummary}` : `[Diagnostic IA]: ${data.diagnosisSummary}`);
        }
      }
    } catch (err) {
      console.error('Erreur scan IA:', err);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fallbackPhoto = 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80';
    const finalPhoto = photoUrl || fallbackPhoto;

    const initialLog: PlantLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      photoUrl: finalPhoto,
      heightCm: initialHeight,
      leafCount: initialLeaves,
      healthScore: 90,
      stage: stage,
      notes: notes || 'Première photo enregistrée pour le suivi de croissance.',
      actionsTaken: ['Arrosage', 'Installation']
    };

    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      name: name || 'Nouvelle Plante',
      species: species || 'Espèce végétale',
      scientificName: scientificName || species || 'Plantae',
      category: category,
      location: location,
      dateAcquired: new Date().toISOString().split('T')[0],
      wateringIntervalDays: wateringDays,
      coverImage: finalPhoto,
      notes: notes,
      logs: [initialLog]
    };

    onAddPlant(newPlant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#141614] rounded-3xl shadow-2xl overflow-hidden border border-stone-800 my-8 text-stone-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#181b18]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold border border-emerald-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-100 text-lg font-['Outfit',sans-serif]">
              Ajouter une nouvelle plante
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
          
          {/* Photo Capture Banner */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-300">Photo de départ</label>
            
            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-stone-950 border border-stone-800 shadow-inner">
                <img src={photoUrl} alt="Aperçu plante" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => runAiScan(photoUrl)}
                    disabled={isAiScanning}
                    className="bg-emerald-950/90 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-md border border-emerald-500/30 flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiScanning ? 'animate-spin' : ''}`} />
                    {isAiScanning ? 'Analyse...' : 'Re-scanner par IA'}
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
                  <p className="text-sm font-bold text-stone-200">Prendre une photo ou importer un fichier</p>
                  <p className="text-xs text-stone-400">L'IA identifiera l'espèce et remplira les données automatiquement !</p>
                </div>
              </div>
            )}
          </div>

          {/* Plant Name & Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Nom personnalisé *</label>
              <input
                type="text"
                required
                placeholder="Ex: Monstera Stella, Ficus Bob..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Espèce / Nom commun</label>
              <input
                type="text"
                placeholder="Ex: Monstera Deliciosa..."
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category, Location & Watering */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Plant['category'])}
                className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Interieur" className="bg-[#141614] text-stone-200">Intérieur</option>
                <option value="Balcon" className="bg-[#141614] text-stone-200">Balcon & Terrasse</option>
                <option value="Succulente & Cactus" className="bg-[#141614] text-stone-200">Succulente & Cactus</option>
                <option value="Potager & Aromatique" className="bg-[#141614] text-stone-200">Potager & Aromatique</option>
                <option value="Orchidée" className="bg-[#141614] text-stone-200">Orchidée</option>
                <option value="Bonsaï" className="bg-[#141614] text-stone-200">Bonsaï</option>
                <option value="Autre" className="bg-[#141614] text-stone-200">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Emplacement</label>
              <input
                type="text"
                placeholder="Ex: Salon Sud, Véranda..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Arrosage (jours)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={wateringDays}
                onChange={(e) => setWateringDays(Number(e.target.value))}
                className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Initial measurements */}
          <div className="grid grid-cols-3 gap-3 bg-[#1a1e1a] p-3 rounded-2xl border border-stone-800">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Hauteur (cm)</label>
              <input
                type="number"
                min="1"
                value={initialHeight}
                onChange={(e) => setInitialHeight(Number(e.target.value))}
                className="w-full bg-[#141614] border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Feuilles</label>
              <input
                type="number"
                min="1"
                value={initialLeaves}
                onChange={(e) => setInitialLeaves(Number(e.target.value))}
                className="w-full bg-[#141614] border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">Stade départ</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PlantLog['stage'])}
                className="w-full bg-[#141614] border border-stone-800 rounded-xl px-2 py-1.5 text-xs text-stone-200 focus:border-emerald-500"
              >
                <option value="Semis" className="bg-[#141614]">Semis</option>
                <option value="Bouture" className="bg-[#141614]">Bouture</option>
                <option value="Croissance active" className="bg-[#141614]">Croissance</option>
                <option value="Floraison" className="bg-[#141614]">Floraison</option>
                <option value="Mature" className="bg-[#141614]">Mature</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Notes & Conseils</label>
            <textarea
              rows={2}
              placeholder="Conseils de soin, date de rempotage, engrais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
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
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all border border-emerald-500/30"
            >
              Enregistrer la plante & Commencer le suivi
            </button>
          </div>

        </form>

        {/* Camera capture sub-modal */}
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={handlePhotoCaptured}
          title="Photographier la nouvelle plante"
        />

      </div>
    </div>
  );
};
