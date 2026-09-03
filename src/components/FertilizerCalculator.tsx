import React, { useState, useMemo } from 'react';
import { Plant } from '../types';
import {
  calculateFertilizerDosage,
  getPlantFertilizerProfile,
  FertilizerType,
  Season
} from '../utils/fertilizer';
import {
  FlaskConical,
  Droplets,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sun,
  CloudSnow,
  Scale,
  Calendar,
  Check,
  Zap,
  HelpCircle,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FertilizerCalculatorProps {
  plant: Plant;
  onLogFertilizerCare?: (plantId: string, notes: string) => void;
}

export const FertilizerCalculator: React.FC<FertilizerCalculatorProps> = ({
  plant,
  onLogFertilizerCare
}) => {
  // Extract latest height from logs or fallback
  const latestLog = plant.logs[plant.logs.length - 1];
  const initialHeight = latestLog?.heightCm || 35;

  // Interactive Calculator State
  const [plantHeightCm, setPlantHeightCm] = useState<number>(initialHeight);
  const [waterVolumeLiters, setWaterVolumeLiters] = useState<number>(1.0); // 1 Liter default
  const [season, setSeason] = useState<Season>(
    // Auto-detect current month: April-September = spring/summer, October-March = autumn/winter
    new Date().getMonth() >= 3 && new Date().getMonth() <= 8 ? 'spring_summer' : 'autumn_winter'
  );
  const [fertilizerType, setFertilizerType] = useState<FertilizerType>('liquid_mineral');
  const [appliedToday, setAppliedToday] = useState(false);

  // Compute profile and calculated dosage
  const profile = useMemo(() => getPlantFertilizerProfile(plant), [plant]);

  const dosage = useMemo(() => {
    return calculateFertilizerDosage(plant, waterVolumeLiters, plantHeightCm, season, fertilizerType);
  }, [plant, waterVolumeLiters, plantHeightCm, season, fertilizerType]);

  const handleApplyFertilizer = () => {
    setAppliedToday(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    if (onLogFertilizerCare) {
      onLogFertilizerCare(
        plant.id,
        `Fertilisation effectuée (${dosage.liquidDoseMl} ml pour ${waterVolumeLiters}L d'eau - ${profile.recommendedNpk})`
      );
    }
  };

  const handleReset = () => {
    setPlantHeightCm(initialHeight);
    setWaterVolumeLiters(1.0);
  };

  return (
    <div className="bg-[#141614] rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-7 relative overflow-hidden">
      
      {/* Decorative subtle background aura */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-100 font-['Outfit',sans-serif]">
                Calculateur de Dosage d'Engrais & Nutriments
              </h2>
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Sur-Mesure
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Formule ajustée pour <strong>{plant.name}</strong> ({profile.plantCategory}) • Hauteur mesurée : <strong>{plantHeightCm} cm</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 bg-[#1a1e1a] px-3 py-1.5 rounded-xl border border-stone-800 self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* Parameter Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Water Volume (Liters) */}
        <div className="bg-[#181d18] p-4 rounded-2xl border border-stone-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-400" />
              Volume d'Arrosage
            </span>
            <span className="font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              {waterVolumeLiters} Litre{waterVolumeLiters > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {[0.5, 1.0, 1.5, 2.0, 3.0].map((vol) => (
              <button
                key={vol}
                onClick={() => setWaterVolumeLiters(vol)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  waterVolumeLiters === vol
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                    : 'bg-[#121612] text-stone-400 hover:text-stone-200 border-stone-800'
                }`}
              >
                {vol}L
              </button>
            ))}
          </div>

          <input
            type="range"
            min="0.25"
            max="5"
            step="0.25"
            value={waterVolumeLiters}
            onChange={(e) => setWaterVolumeLiters(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* 2. Plant Height Adjuster */}
        <div className="bg-[#181d18] p-4 rounded-2xl border border-stone-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400" />
              Taille / Hauteur
            </span>
            <span className="font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              {plantHeightCm} cm
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
            <span>Pot estimé : ~{dosage.potEstimateLiters} L</span>
            <span className="text-stone-500">
              {plantHeightCm < 25 ? 'Jeune pousse' : plantHeightCm <= 70 ? 'Adulte' : 'Spécimen grand'}
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="180"
            step="5"
            value={plantHeightCm}
            onChange={(e) => setPlantHeightCm(parseInt(e.target.value))}
            className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* 3. Season / Period */}
        <div className="bg-[#181d18] p-4 rounded-2xl border border-stone-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              Période & Saison
            </span>
            <span className="text-[10px] text-stone-400">Cycle végétatif</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => setSeason('spring_summer')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                season === 'spring_summer'
                  ? 'bg-amber-950 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-[#121612] text-stone-400 hover:text-stone-200 border-stone-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Printemps/Été</span>
            </button>

            <button
              onClick={() => setSeason('autumn_winter')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                season === 'autumn_winter'
                  ? 'bg-sky-950 text-sky-300 border-sky-500/50 shadow-sm'
                  : 'bg-[#121612] text-stone-400 hover:text-stone-200 border-stone-800'
              }`}
            >
              <CloudSnow className="w-3.5 h-3.5 text-sky-400" />
              <span>Automne/Hiver</span>
            </button>
          </div>
        </div>

        {/* 4. Fertilizer Type Formulation */}
        <div className="bg-[#181d18] p-4 rounded-2xl border border-stone-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-300 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-teal-400" />
              Type d'Engrais
            </span>
            <span className="text-[10px] text-stone-400">Formulation</span>
          </div>

          <select
            value={fertilizerType}
            onChange={(e) => setFertilizerType(e.target.value as FertilizerType)}
            className="w-full bg-[#121612] text-xs font-semibold text-stone-200 border border-stone-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="liquid_mineral">Engrais Liquide Minéral (Standard)</option>
            <option value="liquid_organic">Engrais Liquide Organique (Bio)</option>
            <option value="homemade_tea">Thé de compost / Purin végétal</option>
            <option value="slow_release_pellets">Granulés / Bâtonnets solides</option>
          </select>
        </div>

      </div>

      {/* Primary Dosage Result Display Hero Card */}
      <div className="bg-gradient-to-br from-[#162316] via-[#121712] to-[#0d100d] rounded-3xl p-6 sm:p-8 border border-emerald-500/40 shadow-xl relative overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Numerical Value & Measurement Gauge */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Dosage Recommandé Exact
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 font-['Outfit',sans-serif]">
                  {dosage.liquidDoseMl}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                  ml
                </span>
                <span className="text-sm font-semibold text-stone-400">
                  pour {waterVolumeLiters}L d'eau
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1 font-medium">
                Soit l'équivalent de : <strong className="text-emerald-300">{dosage.capFractionText}</strong> (~{dosage.liquidDoseDrops} gouttes).
              </p>
            </div>

            {/* Quick action button to log */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleApplyFertilizer}
                disabled={appliedToday}
                className={`py-3 px-5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                  appliedToday
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 hover:shadow-xl border border-emerald-400/30 cursor-pointer active:scale-95'
                }`}
              >
                {appliedToday ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Apport d'engrais enregistré aujourd'hui ! 🎉</span>
                  </>
                ) : (
                  <>
                    <Droplets className="w-4 h-4 text-emerald-200" />
                    <span>Marquer un apport d'engrais effectué aujourd'hui</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Alternative Format & NPK Profile */}
          <div className="lg:col-span-6 space-y-3.5 bg-[#141814]/80 backdrop-blur-md p-5 rounded-2xl border border-stone-800/90">
            <h3 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              Profil Nutritif Cible ({profile.plantCategory})
            </h3>

            <div className="bg-[#181d18] p-3 rounded-xl border border-stone-800 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-stone-300">Formule NPK idéale :</span>
                <span className="text-emerald-400">{profile.recommendedNpk}</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {profile.npkRationale}
              </p>
            </div>

            {/* Alternative solid format */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#181d18] p-2.5 rounded-xl border border-stone-800">
                <p className="text-[10px] text-stone-400 font-semibold uppercase">Si Bâtonnets solides</p>
                <p className="font-bold text-stone-200 mt-0.5">{dosage.sticksRecommended} bâtonnet(s)</p>
                <p className="text-[10px] text-stone-500">à insérer dans le terreau</p>
              </div>

              <div className="bg-[#181d18] p-2.5 rounded-xl border border-stone-800">
                <p className="text-[10px] text-stone-400 font-semibold uppercase">Fréquence optimale</p>
                <p className="font-bold text-emerald-400 mt-0.5 line-clamp-1">{profile.frequencyText}</p>
                <p className="text-[10px] text-stone-500">{season === 'spring_summer' ? 'Période active' : 'Période ralentie'}</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Step-by-Step Preparation Protocol */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Protocole de Préparation en 4 Étapes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: '1',
              title: 'Eau Tempérée',
              desc: `Remplir l'arrosoir de ${waterVolumeLiters}L d'eau non calcaire à température ambiante (18-22°C).`
            },
            {
              step: '2',
              title: 'Mesure Précise',
              desc: `Prélever exactement ${dosage.liquidDoseMl} ml (${dosage.capFractionText}) à l'aide d'une pipette ou du bouchon.`
            },
            {
              step: '3',
              title: 'Homogénéisation',
              desc: `Verser dans l'eau et remuer doucement pour répartir uniformément les oligo-éléments.`
            },
            {
              step: '4',
              title: 'Application au Pied',
              desc: `Arroser sur un terreau déjà légèrement humide pour éviter tout choc osmotique aux racines.`
            }
          ].map((item) => (
            <div key={item.step} className="bg-[#181d18] p-4 rounded-2xl border border-stone-800/80 space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-black">
                {item.step}
              </div>
              <h4 className="text-xs font-bold text-stone-100">{item.title}</h4>
              <p className="text-[11px] text-stone-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Precautions & Tips */}
      <div className="bg-[#191612] border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200/90">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">Règles d'Or & Précautions de Sécurité :</p>
          <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px]">
            {profile.safetyTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
            <li>
              <strong>Saison :</strong> {profile.seasonAdvice}
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};
