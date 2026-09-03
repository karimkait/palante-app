import React from 'react';
import { Plant } from '../types';
import { computeGardeningChallenges, GardeningChallenge } from '../utils/challenges';
import { Trophy, Zap, ChevronRight, Award, CheckCircle2, Lock, ArrowRight, Sparkles, Droplets, Leaf } from 'lucide-react';

interface GardeningChallengesWidgetProps {
  plants: Plant[];
  onOpenChallengesTab: () => void;
  onSelectChallenge?: (challenge: GardeningChallenge) => void;
  onOpenAddPlant?: () => void;
  onOpenWatering?: () => void;
}

export const GardeningChallengesWidget: React.FC<GardeningChallengesWidgetProps> = ({
  plants,
  onOpenChallengesTab,
  onSelectChallenge,
  onOpenAddPlant,
  onOpenWatering
}) => {
  const { challenges, userLevel } = computeGardeningChallenges(plants);

  // Pick top key challenges (including 10 days watering & 5 plants)
  const featuredChallenges = challenges.filter(
    (c) => c.id === 'watering_streak_10' || c.id === 'collection_5_plants' || c.id === 'growth_gain_30cm'
  );

  return (
    <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800 shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-950/70 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-100 font-['Outfit',sans-serif]">
                Défis de Jardinage & Badges
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Niv. {userLevel.level} • {userLevel.levelTitle}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {userLevel.totalUnlockedBadges} sur {userLevel.totalChallengesCount} badges débloqués • {userLevel.currentXp} XP accumulés
            </p>
          </div>
        </div>

        <button
          onClick={onOpenChallengesTab}
          className="py-2 px-3.5 bg-[#1b221b] hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Tous les défis & Trophées</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Featured Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredChallenges.map((challenge) => {
          const progressPercent = Math.min(
            100,
            Math.round((challenge.currentProgress / challenge.targetProgress) * 100)
          );

          return (
            <div
              key={challenge.id}
              onClick={() => onSelectChallenge ? onSelectChallenge(challenge) : onOpenChallengesTab()}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                challenge.isUnlocked
                  ? 'bg-[#182118] border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-[#191c19] border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{challenge.badgeIcon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-stone-100 line-clamp-1 font-['Outfit',sans-serif]">
                      {challenge.title}
                    </h3>
                    <p className="text-[10px] text-emerald-400 font-medium">{challenge.badgeName}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0">
                  +{challenge.xpPoints} XP
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-semibold">
                  <span className="text-stone-400">Progression :</span>
                  <span className={challenge.isUnlocked ? 'text-emerald-400' : 'text-stone-300'}>
                    {challenge.currentProgress} / {challenge.targetProgress} {challenge.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      challenge.isUnlocked
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-emerald-600/80'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                {challenge.isUnlocked ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Badge Obtenu !
                  </span>
                ) : (
                  <span className="text-stone-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-stone-500" /> En cours ({progressPercent}%)
                  </span>
                )}
                <span className="text-emerald-400 hover:underline font-semibold flex items-center gap-0.5 text-[10px]">
                  Détails <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
