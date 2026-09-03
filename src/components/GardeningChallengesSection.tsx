import React, { useState, useMemo } from 'react';
import { Plant } from '../types';
import {
  computeGardeningChallenges,
  GardeningChallenge,
  ChallengeCategory,
  BadgeTier
} from '../utils/challenges';
import { BadgeDetailModal } from './BadgeDetailModal';
import {
  Trophy,
  Award,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
  Droplets,
  PlusCircle,
  Leaf,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GardeningChallengesSectionProps {
  plants: Plant[];
  onNavigateTab?: (tab: string) => void;
  onOpenAddPlant?: () => void;
  onQuickSnapPhoto?: () => void;
  onOpenWateringPanel?: () => void;
}

export const GardeningChallengesSection: React.FC<GardeningChallengesSectionProps> = ({
  plants,
  onNavigateTab,
  onOpenAddPlant,
  onQuickSnapPhoto,
  onOpenWateringPanel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'in_progress'>('all');
  const [inspectingChallenge, setInspectingChallenge] = useState<GardeningChallenge | null>(null);

  // Compute challenges and user level
  const { challenges, userLevel } = useMemo(() => {
    return computeGardeningChallenges(plants);
  }, [plants]);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'unlocked'
          ? c.isUnlocked
          : !c.isUnlocked;
      return matchCategory && matchStatus;
    });
  }, [challenges, selectedCategory, statusFilter]);

  const handleChallengeClick = (challenge: GardeningChallenge) => {
    setInspectingChallenge(challenge);
    if (challenge.isUnlocked) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleActionClick = (challenge: GardeningChallenge, e: React.MouseEvent) => {
    e.stopPropagation();
    if (challenge.isUnlocked) {
      handleChallengeClick(challenge);
      return;
    }

    if (challenge.actionCta?.actionKey === 'add_plant') {
      onOpenAddPlant?.();
    } else if (challenge.actionCta?.actionKey === 'open_watering') {
      onOpenWateringPanel?.();
    } else if (challenge.actionCta?.actionKey === 'quick_camera') {
      onQuickSnapPhoto?.();
    } else if (challenge.actionCta?.tab) {
      onNavigateTab?.(challenge.actionCta.tab);
    } else {
      handleChallengeClick(challenge);
    }
  };

  const getTierColor = (tier: BadgeTier) => {
    switch (tier) {
      case 'diamond':
        return 'text-sky-300 bg-sky-950/80 border-sky-500/40';
      case 'gold':
        return 'text-amber-300 bg-amber-950/80 border-amber-500/40';
      case 'silver':
        return 'text-stone-300 bg-stone-900 border-stone-600/50';
      default:
        return 'text-orange-300 bg-orange-950/80 border-orange-600/40';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Hero Level & XP Banner */}
      <div className="bg-gradient-to-br from-[#182318] via-[#141814] to-[#0f120f] rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Système de Récompenses & Défis de Jardinage
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-['Outfit',sans-serif]">
                Niveau {userLevel.level} : {userLevel.levelTitle}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Relevez des défis botaniques quotidiens pour débloquer des badges virtuels exclusifs et faire évoluer votre rang de jardinier !
            </p>
          </div>

          {/* XP Progress Card */}
          <div className="bg-[#121612]/90 backdrop-blur-md p-5 rounded-2xl border border-stone-800/90 shadow-md min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Expérience Botanique
              </span>
              <span className="font-extrabold text-emerald-400">
                {userLevel.currentXp} / {userLevel.nextLevelXp} XP
              </span>
            </div>

            {/* Level Bar */}
            <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${userLevel.levelProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>{userLevel.totalUnlockedBadges} / {userLevel.totalChallengesCount} Badges débloqués</span>
              <span className="text-amber-400 font-semibold">{100 - userLevel.levelProgressPercent}% restant avant Niv. {userLevel.level + 1}</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Badge Showcase Shelf */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {challenges.slice(0, 4).map((c) => (
            <div
              key={c.id}
              onClick={() => handleChallengeClick(c)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                c.isUnlocked
                  ? 'bg-[#1b221b] border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-[#141614] border-stone-800/80 hover:border-stone-700 opacity-70'
              }`}
            >
              <div className="text-2xl shrink-0">{c.badgeIcon}</div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-100 truncate">{c.badgeName}</p>
                <p className="text-[10px] text-stone-400 truncate">{c.isUnlocked ? 'Débloqué 🎉' : `${c.currentProgress}/${c.targetProgress} ${c.unit}`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Filters & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141614] p-4 rounded-3xl border border-stone-800 shadow-md">
        
        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Tous les Défis' },
            { id: 'watering', label: 'Arrosage & Soins', icon: Droplets },
            { id: 'collection', label: 'Collection & Variété', icon: Leaf },
            { id: 'growth', label: 'Croissance & Vitalité', icon: TrendingUp },
            { id: 'creativity', label: 'Créativité & Partage', icon: Sparkles }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 bg-[#1a1e1a] border border-stone-800'
              }`}
            >
              {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center bg-[#1a1e1a] p-1 rounded-2xl border border-stone-800 self-end sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'all' ? 'bg-[#222922] text-emerald-300' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Tous ({challenges.length})
          </button>
          <button
            onClick={() => setStatusFilter('unlocked')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'unlocked' ? 'bg-[#222922] text-emerald-300' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Débloqués ({userLevel.totalUnlockedBadges})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'in_progress' ? 'bg-[#222922] text-emerald-300' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            En cours ({challenges.length - userLevel.totalUnlockedBadges})
          </button>
        </div>
      </div>

      {/* 3. Challenge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChallenges.map((challenge) => {
          const progressPercent = Math.min(
            100,
            Math.round((challenge.currentProgress / challenge.targetProgress) * 100)
          );

          return (
            <div
              key={challenge.id}
              onClick={() => handleChallengeClick(challenge)}
              className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                challenge.isUnlocked
                  ? 'bg-[#151c15] border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/30'
                  : 'bg-[#141614] border-stone-800 hover:border-stone-700'
              }`}
            >
              {/* Subtle accent glow if unlocked */}
              {challenge.isUnlocked && (
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: challenge.badgeColor }}
                />
              )}

              <div className="space-y-4">
                {/* Top header: Badge Icon + Tier + XP */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border transition-transform group-hover:scale-105 ${
                        challenge.isUnlocked
                          ? 'border-emerald-500/50 bg-[#1e291e]'
                          : 'border-stone-800 bg-stone-900 grayscale opacity-60'
                      }`}
                    >
                      {challenge.badgeIcon}
                    </div>
                    <div>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${getTierColor(challenge.badgeTier)}`}>
                        {challenge.badgeTier}
                      </span>
                      <h3 className="text-sm font-bold text-stone-100 mt-1 font-['Outfit',sans-serif]">
                        {challenge.badgeName}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1 shrink-0">
                    <Zap className="w-3 h-3 text-amber-400" />
                    +{challenge.xpPoints} XP
                  </span>
                </div>

                {/* Challenge Title & Description */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-400">
                    {challenge.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed line-clamp-2">
                    {challenge.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-stone-400">Objectif :</span>
                    <span className={challenge.isUnlocked ? 'text-emerald-400' : 'text-stone-300'}>
                      {challenge.currentProgress} / {challenge.targetProgress} {challenge.unit} ({progressPercent}%)
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
              </div>

              {/* Card Footer Button */}
              <div className="pt-4 mt-3 border-t border-stone-800/80 flex items-center justify-between">
                {challenge.isUnlocked ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Badge Acquis !</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                    <span>En cours</span>
                  </div>
                )}

                <button
                  onClick={(e) => handleActionClick(challenge, e)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                    challenge.isUnlocked
                      ? 'bg-[#1d271d] hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30'
                      : 'bg-stone-900 hover:bg-emerald-700 text-stone-200 hover:text-white border border-stone-800 hover:border-emerald-500/40'
                  }`}
                >
                  <span>{challenge.isUnlocked ? 'Voir Badge' : challenge.actionCta?.label || 'Détails'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Detail Modal */}
      {inspectingChallenge && (
        <BadgeDetailModal
          challenge={inspectingChallenge}
          onClose={() => setInspectingChallenge(null)}
          onNavigateAction={(tab, actionKey) => {
            if (actionKey === 'add_plant') onOpenAddPlant?.();
            else if (actionKey === 'open_watering') onOpenWateringPanel?.();
            else if (actionKey === 'quick_camera') onQuickSnapPhoto?.();
            else if (tab) onNavigateTab?.(tab);
          }}
        />
      )}
    </div>
  );
};
