import React, { useState, useEffect } from 'react';
import { Plant, PlantLog, PlantDiagnosis } from './types';
import { INITIAL_PLANTS } from './mockData';
import { Navbar, AppTab } from './components/Navbar';
import { PlantCard } from './components/PlantCard';
import { PlantDetailView } from './components/PlantDetailView';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { SocialAdStudio } from './components/SocialAdStudio';
import { AddPlantModal } from './components/AddPlantModal';
import { AddLogModal } from './components/AddLogModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { AiDoctorModal } from './components/AiDoctorModal';
import {
  Sparkles,
  Camera,
  Layers,
  Leaf,
  Share2,
  TrendingUp,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Calendar
} from 'lucide-react';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>(() => {
    try {
      const saved = localStorage.getItem('botanicatrack_plants_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load plants from localStorage:', e);
    }
    return INITIAL_PLANTS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('botanicatrack_plants_v1', JSON.stringify(plants));
    } catch (e) {
      console.warn('Could not save plants to localStorage:', e);
    }
  }, [plants]);

  const [currentTab, setCurrentTab] = useState<AppTab>('garden');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Modals state
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [logModalPlant, setLogModalPlant] = useState<Plant | null>(null);
  const [isQuickCameraOpen, setIsQuickCameraOpen] = useState(false);
  const [aiDoctorData, setAiDoctorData] = useState<{
    isOpen: boolean;
    photoUrl?: string;
    plant?: Plant;
  }>({ isOpen: false });

  // Ad studio parameters when navigated from plant card
  const [adStudioInitialPlantId, setAdStudioInitialPlantId] = useState<string | undefined>(undefined);
  const [adStudioBeforeLogId, setAdStudioBeforeLogId] = useState<string | undefined>(undefined);
  const [adStudioAfterLogId, setAdStudioAfterLogId] = useState<string | undefined>(undefined);

  // Search & category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Timeline comparative plant state
  const [timelinePlantId, setTimelinePlantId] = useState<string>(plants[0]?.id || '');
  const activeTimelinePlant = plants.find((p) => p.id === timelinePlantId) || plants[0];

  // Calculations for global dashboard
  const totalPhotosLogged = plants.reduce((acc, p) => acc + p.logs.length, 0);
  const avgHealth = Math.round(
    plants.reduce((acc, p) => {
      const last = p.logs[p.logs.length - 1];
      return acc + (last?.healthScore || 90);
    }, 0) / (plants.length || 1)
  );

  // Filtered plants
  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Add new plant handler
  const handleAddPlant = (newPlant: Plant) => {
    setPlants((prev) => [newPlant, ...prev]);
    setSelectedPlant(newPlant);
  };

  // Add new log handler
  const handleAddLog = (plantId: string, newLog: PlantLog) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id === plantId) {
          const updatedLogs = [...p.logs, newLog];
          return {
            ...p,
            coverImage: newLog.photoUrl,
            lastWateredDate: newLog.actionsTaken?.includes('Arrosage') ? newLog.date : p.lastWateredDate,
            logs: updatedLogs
          };
        }
        return p;
      })
    );

    // Update selected plant view if open
    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) =>
        prev
          ? {
              ...prev,
              coverImage: newLog.photoUrl,
              logs: [...prev.logs, newLog]
            }
          : null
      );
    }
  };

  // Open Ad Studio preconfigured for a plant
  const handleOpenAdStudio = (plantId: string, beforeLogId?: string, afterLogId?: string) => {
    setAdStudioInitialPlantId(plantId);
    setAdStudioBeforeLogId(beforeLogId);
    setAdStudioAfterLogId(afterLogId);
    setSelectedPlant(null);
    setCurrentTab('ads_studio');
  };

  // Quick photo captured from navbar
  const handleQuickPhotoCaptured = (photo: string, triggerAiDiagnostic?: boolean) => {
    if (triggerAiDiagnostic) {
      setAiDoctorData({ isOpen: true, photoUrl: photo });
    } else if (plants.length > 0) {
      // Prompt user to add to first plant or create a new one
      setLogModalPlant(plants[0]);
    } else {
      setIsAddPlantOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0c] text-[#e0e0e0] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedPlant(null);
          setCurrentTab(tab);
        }}
        onOpenAddPlant={() => setIsAddPlantOpen(true)}
        onQuickSnapPhoto={() => setIsQuickCameraOpen(true)}
        totalPlantsCount={plants.length}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* VIEW 1: SINGLE PLANT DETAIL VIEW */}
        {selectedPlant ? (
          <PlantDetailView
            plant={selectedPlant}
            onBack={() => setSelectedPlant(null)}
            onAddPhoto={(p) => setLogModalPlant(p)}
            onOpenAdStudio={handleOpenAdStudio}
            onOpenAiDoctor={(photo, p) => setAiDoctorData({ isOpen: true, photoUrl: photo, plant: p })}
          />
        ) : currentTab === 'garden' ? (
          
          /* VIEW 2: GARDEN DASHBOARD & PLANT GRID */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Hero Stats & Quick Ad Promotion Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Main Welcome & Stats Banner (8 cols) */}
              <div className="lg:col-span-8 bg-gradient-to-br from-emerald-950/80 via-[#141a14] to-[#0c0d0c] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between border border-stone-800">
                <div className="space-y-3 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Suivi Botanique par Photo & Studio Publicitaire
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] leading-tight text-stone-100">
                    Suivez l'évolution de vos plantes & publiez vos progrès
                  </h1>
                  <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Prenez des photos régulières, visualisez les métamorphoses avant/après en direct, diagnostiquez la santé par IA et créez des publicités engageantes pour vos réseaux sociaux.
                  </p>
                </div>

                {/* Quantitative Metric Badges */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-800/80 mt-6 relative z-10">
                  <div className="bg-[#141614]/80 backdrop-blur-md rounded-2xl p-3 border border-stone-800">
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase">Mes Plantes</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-stone-100 mt-0.5">{plants.length}</p>
                  </div>
                  <div className="bg-[#141614]/80 backdrop-blur-md rounded-2xl p-3 border border-stone-800">
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase">Photos d'Évolution</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-stone-100 mt-0.5">{totalPhotosLogged}</p>
                  </div>
                  <div className="bg-[#141614]/80 backdrop-blur-md rounded-2xl p-3 border border-stone-800">
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase">Santé Moyenne</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">{avgHealth} / 100</p>
                  </div>
                </div>
              </div>

              {/* Quick Ad Creator Showcase Card (4 cols) */}
              <div className="lg:col-span-4 bg-[#141614] rounded-3xl p-6 border border-stone-800 shadow-md flex flex-col justify-between space-y-4 text-stone-200">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-100 font-['Outfit',sans-serif]">
                    Créateur de Pub Réseaux Sociaux
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Transformez l'avant/après de n'importe quelle plante en publication percutante pour Instagram, TikTok, Facebook ou Pinterest avec textes générés par IA.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setAdStudioInitialPlantId(plants[0]?.id);
                      setCurrentTab('ads_studio');
                    }}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 border border-emerald-500/30"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ouvrir le Studio Publicitaire
                  </button>

                  <button
                    onClick={() => setIsAddPlantOpen(true)}
                    className="w-full py-2.5 px-4 bg-[#1a1e1a] hover:bg-stone-800 text-stone-200 text-xs font-semibold rounded-2xl border border-stone-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Ajouter une nouvelle plante
                  </button>
                </div>
              </div>

            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141614] p-4 rounded-2xl border border-stone-800 shadow-xs">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une plante, espèce, pièce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Toutes' },
                  { id: 'Interieur', label: 'Intérieur' },
                  { id: 'Balcon', label: 'Balcon' },
                  { id: 'Succulente & Cactus', label: 'Succulentes' },
                  { id: 'Potager & Aromatique', label: 'Potager' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500/40'
                        : 'bg-[#1a1e1a] text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Plants Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-stone-100 font-['Outfit',sans-serif]">
                  Mes Plantes en Croissance ({filteredPlants.length})
                </h2>
                <button
                  onClick={() => setIsAddPlantOpen(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une plante
                </button>
              </div>

              {filteredPlants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlants.map((plant) => (
                    <PlantCard
                      key={plant.id}
                      plant={plant}
                      onSelect={(p) => setSelectedPlant(p)}
                      onAddPhoto={(p) => setLogModalPlant(p)}
                      onCreateAd={(p) => handleOpenAdStudio(p.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#141614] rounded-3xl border border-stone-800 p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-100">Aucune plante trouvée</h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Commencez par ajouter votre première plante pour suivre son évolution photo par photo.
                  </p>
                  <button
                    onClick={() => setIsAddPlantOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow border border-emerald-500/30"
                  >
                    + Ajouter une Plante
                  </button>
                </div>
              )}
            </div>

          </div>

        ) : currentTab === 'timeline' ? (
          
          /* VIEW 3: GLOBAL TIMELINE & BEFORE/AFTER COMPARATOR */
          <div className="space-y-8 animate-fadeIn">
            
            <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-['Outfit',sans-serif]">
                    Comparateur & Chronologie d'Évolution
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1">
                    Visualisez la métamorphose de n'importe quelle plante entre deux dates de prise de vue.
                  </p>
                </div>

                {/* Plant Selector for Timeline */}
                <div className="flex items-center gap-2 bg-[#1a1e1a] p-2 rounded-2xl border border-stone-800">
                  <span className="text-xs font-bold text-stone-400 pl-2">Plante :</span>
                  <select
                    value={timelinePlantId}
                    onChange={(e) => setTimelinePlantId(e.target.value)}
                    className="bg-[#141614] border border-stone-800 rounded-xl px-3 py-2 text-xs font-bold text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    {plants.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#141614] text-stone-100">
                        {p.name} ({p.logs.length} photos)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Slider for selected plant */}
            {activeTimelinePlant && activeTimelinePlant.logs.length >= 2 ? (
              <BeforeAfterSlider
                plant={activeTimelinePlant}
                beforeLog={activeTimelinePlant.logs[0]}
                afterLog={activeTimelinePlant.logs[activeTimelinePlant.logs.length - 1]}
                onOpenAdStudio={() =>
                  handleOpenAdStudio(
                    activeTimelinePlant.id,
                    activeTimelinePlant.logs[0].id,
                    activeTimelinePlant.logs[activeTimelinePlant.logs.length - 1].id
                  )
                }
              />
            ) : (
              <div className="p-12 text-center bg-[#141614] rounded-3xl border border-stone-800 space-y-3">
                <p className="text-stone-300 font-bold text-base">
                  Au moins 2 photos sont nécessaires pour comparer l'évolution de cette plante.
                </p>
                <button
                  onClick={() => setLogModalPlant(activeTimelinePlant)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow border border-emerald-500/30"
                >
                  + Ajouter une 2e photo
                </button>
              </div>
            )}

            {/* Overview of all plants progress */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-stone-100 font-['Outfit',sans-serif]">
                Toutes les évolutions enregistrées
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plants.map((plant) => {
                  const first = plant.logs[0];
                  const last = plant.logs[plant.logs.length - 1];
                  const heightDelta = last && first ? (last.heightCm || 0) - (first.heightCm || 0) : 0;
                  return (
                    <div
                      key={plant.id}
                      onClick={() => setSelectedPlant(plant)}
                      className="bg-[#141614] rounded-3xl p-4 border border-stone-800 shadow-sm hover:border-stone-700 transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={last?.photoUrl || plant.coverImage}
                          alt={plant.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-stone-800"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-stone-100">{plant.name}</h4>
                          <p className="text-[11px] text-stone-400">{plant.logs.length} étapes enregistrées</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-[#1a1e1a] p-2.5 rounded-xl border border-stone-800">
                        <span className="text-stone-400 font-medium">Progression :</span>
                        <span className="font-bold text-emerald-400">
                          {heightDelta > 0 ? `+${heightDelta} cm de hauteur` : 'Croissance saine'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        ) : currentTab === 'ads_studio' ? (
          
          /* VIEW 4: SOCIAL MEDIA ADVERTISING & POST STUDIO */
          <SocialAdStudio
            plants={plants}
            initialPlantId={adStudioInitialPlantId}
            initialBeforeLogId={adStudioBeforeLogId}
            initialAfterLogId={adStudioAfterLogId}
          />

        ) : currentTab === 'ai_doctor' ? (
          
          /* VIEW 5: AI BOTANICAL CLINIC / DOCTOR */
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-emerald-950 via-[#172417] to-[#0c0d0c] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-stone-800">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Diagnostic & Traitement par IA
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-stone-100">
                  Clinique Botanique & Analyse de Santé
                </h1>
                <p className="text-stone-300 text-sm">
                  Prenez une photo de n'importe quelle plante pour identifier son espèce, vérifier ses signes vitaux et recevoir des conseils sur-mesure d'arrosage, d'ensoleillement et de fertilisation.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setAiDoctorData({ isOpen: true })}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 border border-emerald-500/30"
                  >
                    <Camera className="w-4 h-4" />
                    Lancer un Diagnostic par Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Cards of Current Plants Health */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-stone-100 font-['Outfit',sans-serif]">
                Santé actuelle de votre collection
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {plants.map((p) => {
                  const lastLog = p.logs[p.logs.length - 1];
                  const score = lastLog?.healthScore || 90;
                  return (
                    <div
                      key={p.id}
                      className="bg-[#141614] rounded-3xl p-5 border border-stone-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={lastLog?.photoUrl || p.coverImage}
                          alt={p.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-stone-800"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-stone-100">{p.name}</h4>
                          <p className="text-xs text-stone-400 italic">{p.species}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            Score : {score}/100
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setAiDoctorData({
                            isOpen: true,
                            photoUrl: lastLog?.photoUrl || p.coverImage,
                            plant: p
                          })
                        }
                        className="w-full py-2 bg-[#1a1e1a] hover:bg-emerald-950 text-emerald-300 font-bold text-xs rounded-xl border border-stone-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Re-scanner la santé
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        ) : null}

      </main>

      {/* Footer */}
      <footer className="bg-[#141614] border-t border-stone-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>BotanicaTrack • Suivi de croissance végétale & Studio publicitaire réseaux sociaux</span>
          </div>
          <p>Propulsé par Google Gemini 3.7 Flash & React</p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Add Plant Modal */}
      <AddPlantModal
        isOpen={isAddPlantOpen}
        onClose={() => setIsAddPlantOpen(false)}
        onAddPlant={handleAddPlant}
      />

      {/* 2. Add Log Modal for existing plant */}
      {logModalPlant && (
        <AddLogModal
          isOpen={!!logModalPlant}
          plant={logModalPlant}
          onClose={() => setLogModalPlant(null)}
          onAddLog={handleAddLog}
        />
      )}

      {/* 3. Quick Navbar Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isQuickCameraOpen}
        onClose={() => setIsQuickCameraOpen(false)}
        onPhotoCaptured={handleQuickPhotoCaptured}
        title="Capture instantanée de plante"
      />

      {/* 4. AI Doctor Clinic Modal */}
      <AiDoctorModal
        isOpen={aiDoctorData.isOpen}
        initialPhotoUrl={aiDoctorData.photoUrl}
        initialPlant={aiDoctorData.plant}
        onClose={() => setAiDoctorData({ isOpen: false })}
        onAddAsNewPlant={(diag, photo) => {
          const newPlant: Plant = {
            id: `plant-${Date.now()}`,
            name: diag.speciesName || 'Nouvelle Plante',
            species: diag.speciesName || 'Espèce végétale',
            scientificName: diag.scientificName || 'Plantae',
            category: 'Interieur',
            location: 'Salon',
            dateAcquired: new Date().toISOString().split('T')[0],
            wateringIntervalDays: 7,
            coverImage: photo,
            notes: diag.diagnosisSummary,
            logs: [
              {
                id: `log-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                photoUrl: photo,
                heightCm: 25,
                leafCount: 5,
                healthScore: diag.healthScore,
                stage: 'Croissance active',
                notes: diag.diagnosisSummary,
                diagnosis: diag
              }
            ]
          };
          handleAddPlant(newPlant);
        }}
      />
    </div>
  );
}
