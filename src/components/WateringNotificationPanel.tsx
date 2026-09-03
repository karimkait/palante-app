import React, { useState, useEffect } from 'react';
import { Plant } from '../types';
import {
  PlantWateringStatus,
  getAllPlantsWateringSummary
} from '../utils/watering';
import {
  Bell,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface WateringNotificationPanelProps {
  plants: Plant[];
  isOpen: boolean;
  onClose: () => void;
  onWaterPlant: (plantId: string) => void;
  onWaterAllDue: () => void;
  onSelectPlant: (plant: Plant) => void;
}

export const WateringNotificationPanel: React.FC<WateringNotificationPanelProps> = ({
  plants,
  isOpen,
  onClose,
  onWaterPlant,
  onWaterAllDue,
  onSelectPlant
}) => {
  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('botanicatrack_sound_alert') !== 'false';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotificationStatus(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationStatus(permission);
        if (permission === 'granted') {
          new Notification('BotanicaTrack • Notifications activées 🌱', {
            body: 'Vous recevrez des rappels quand vos plantes auront soif.',
            icon: '/icon.png'
          });
        }
      } catch (err) {
        console.error('Erreur de permission notification:', err);
      }
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('botanicatrack_sound_alert', String(next));
  };

  if (!isOpen) return null;

  const summary = getAllPlantsWateringSummary(plants);
  const { overdue, dueToday, upcoming, ok, needsWaterCount } = summary;

  return (
    <div className="fixed inset-0 z-50 flex justify-end p-0 sm:p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] bg-[#141614] border border-stone-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-[#181b18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-100 font-['Outfit',sans-serif]">
                  Rappels d'Arrosage
                </h3>
                {needsWaterCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-red-950 text-red-300 border border-red-500/40">
                    {needsWaterCount} urgent{needsWaterCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">
                Fréquences personnalisées par plante
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
              className="p-2 text-stone-400 hover:text-stone-200 rounded-xl hover:bg-stone-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-200 rounded-xl hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Header & Bulk Water */}
        {needsWaterCount > 0 && (
          <div className="bg-sky-950/40 border-b border-sky-900/40 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-sky-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{needsWaterCount} plante{needsWaterCount > 1 ? 's ont' : ' a'} besoin d'eau aujourd'hui.</span>
            </div>
            <button
              onClick={onWaterAllDue}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
            >
              <Droplets className="w-3.5 h-3.5" />
              Tout arroser
            </button>
          </div>
        )}

        {/* Scrollable List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Overdue / Due Today Section */}
          {(overdue.length > 0 || dueToday.length > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 px-1">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  À ARROSER MAINTENANT ({overdue.length + dueToday.length})
                </span>
              </div>

              <div className="space-y-2">
                {[...overdue, ...dueToday].map((item) => {
                  const targetPlant = plants.find((p) => p.id === item.plantId);
                  return (
                    <div
                      key={item.plantId}
                      className="bg-[#1a1e1a] rounded-2xl p-3.5 border border-stone-800 hover:border-sky-500/40 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div
                        onClick={() => {
                          if (targetPlant) onSelectPlant(targetPlant);
                          onClose();
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={item.coverImage}
                          alt={item.plantName}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-stone-100 truncate">
                              {item.plantName}
                            </h4>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                              {item.statusLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate">
                            {item.location} • Fréquence : tous les {item.intervalDays} jours
                          </p>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Dernier arrosage : il y a {item.daysSinceLastWatered} jour{item.daysSinceLastWatered > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onWaterPlant(item.plantId)}
                        title="Marquer comme arrosée aujourd'hui"
                        className="p-2.5 bg-sky-950/80 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 rounded-xl transition-all shrink-0 flex items-center gap-1 text-xs font-bold shadow"
                      >
                        <Droplets className="w-4 h-4" />
                        <span className="hidden sm:inline">Arroser</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming Section (Next 1-2 days) */}
          {upcoming.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-stone-400 px-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>PROCHAINS ARROSAGES (DANS 1 À 2 JOURS)</span>
              </div>

              <div className="space-y-2">
                {upcoming.map((item) => {
                  const targetPlant = plants.find((p) => p.id === item.plantId);
                  return (
                    <div
                      key={item.plantId}
                      className="bg-[#181b18] rounded-2xl p-3 border border-stone-800/80 flex items-center justify-between gap-3"
                    >
                      <div
                        onClick={() => {
                          if (targetPlant) onSelectPlant(targetPlant);
                          onClose();
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={item.coverImage}
                          alt={item.plantName}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-stone-200 truncate">
                              {item.plantName}
                            </h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-sky-950 text-sky-300 border border-sky-500/30">
                              {item.statusLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate">
                            {item.plantSpecies}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onWaterPlant(item.plantId)}
                        title="Arroser en avance"
                        className="p-2 bg-[#1f231f] hover:bg-sky-900/60 text-stone-300 hover:text-sky-200 border border-stone-700 rounded-xl text-xs font-medium transition-colors shrink-0"
                      >
                        <Droplets className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hydrated & OK Plants */}
          {ok.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-stone-400 px-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PLANTES BIEN HYDRATÉES ({ok.length})</span>
              </div>

              <div className="space-y-2">
                {ok.map((item) => {
                  const targetPlant = plants.find((p) => p.id === item.plantId);
                  return (
                    <div
                      key={item.plantId}
                      onClick={() => {
                        if (targetPlant) onSelectPlant(targetPlant);
                        onClose();
                      }}
                      className="bg-[#161816] rounded-2xl p-3 border border-stone-800/60 flex items-center justify-between gap-3 cursor-pointer hover:border-stone-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.coverImage}
                          alt={item.plantName}
                          className="w-9 h-9 rounded-xl object-cover border border-stone-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-stone-300 truncate">
                            {item.plantName}
                          </h4>
                          <p className="text-[10px] text-emerald-400 font-medium">
                            Prochain arrosage dans {item.daysRemaining} jours
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-stone-500 font-semibold shrink-0">
                        {item.intervalDays}j freq
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {plants.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm text-stone-400">Aucune plante dans votre jardin pour le moment.</p>
            </div>
          )}

        </div>

        {/* Footer / Browser Push Permission Request */}
        <div className="p-4 border-t border-stone-800 bg-[#161816] space-y-2">
          {typeof window !== 'undefined' && 'Notification' in window && browserNotificationStatus !== 'granted' ? (
            <div className="bg-[#1a1e1a] rounded-2xl p-3 border border-stone-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  Activer les alertes du navigateur
                </p>
                <p className="text-[10px] text-stone-400">
                  Recevez un rappel même si l'onglet est en arrière-plan.
                </p>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow"
              >
                Autoriser
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Rappels actifs & synchronisés
              </span>
              <span>{plants.length} plantes suivies</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
