import React from 'react';
import { GardeningChallenge } from '../utils/challenges';
import { X, Award, CheckCircle2, Lock, Sparkles, Calendar, Zap, Share2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeDetailModalProps {
  challenge: GardeningChallenge | null;
  onClose: () => void;
  onNavigateAction?: (tab?: string, actionKey?: string) => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  challenge,
  onClose,
  onNavigateAction
}) => {
  if (!challenge) return null;

  const triggerCelebration = () => {
    if (challenge.isUnlocked) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return 'bg-gradient-to-r from-sky-400 to-indigo-400 text-white border-sky-300';
      case 'gold':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-900 border-amber-300';
      case 'silver':
        return 'bg-gradient-to-r from-stone-300 to-slate-400 text-stone-900 border-stone-200';
      default:
        return 'bg-gradient-to-r from-amber-700 to-orange-600 text-amber-100 border-amber-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#141614] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Glow backdrop effect */}
        <div
          className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: challenge.badgeColor }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Hero Presentation */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-block">
            <div
              onClick={triggerCelebration}
              className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                challenge.isUnlocked
                  ? 'border-emerald-500/60 bg-gradient-to-br from-[#1c291c] to-[#121712]'
                  : 'border-stone-800 bg-[#161816] grayscale opacity-70'
              }`}
              style={{
                boxShadow: challenge.isUnlocked ? `0 10px 30px -5px ${challenge.badgeColor}40` : undefined
              }}
            >
              <span>{challenge.badgeIcon}</span>
            </div>

            {challenge.isUnlocked ? (
              <span className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 text-white rounded-full shadow-lg border-2 border-[#141614]">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="absolute -bottom-2 -right-2 p-1.5 bg-stone-800 text-stone-400 rounded-full shadow-lg border-2 border-[#141614]">
                <Lock className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getTierBadgeStyle(challenge.badgeTier)}`}>
                Rang {challenge.badgeTier}
              </span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <Zap className="w-3 h-3 text-amber-400" />
                +{challenge.xpPoints} XP
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 font-['Outfit',sans-serif]">
              {challenge.badgeName}
            </h2>
            <p className="text-xs font-semibold text-emerald-400">
              Défi : {challenge.title}
            </p>
          </div>
        </div>

        {/* Description & Objective */}
        <div className="bg-[#191d19] rounded-2xl p-4 border border-stone-800/90 space-y-3 text-xs text-stone-300">
          <p className="leading-relaxed text-stone-300 text-center">
            {challenge.description}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-2 border-t border-stone-800/80">
            <div className="flex justify-between font-bold text-[11px]">
              <span className="text-stone-400">Progression :</span>
              <span className={challenge.isUnlocked ? 'text-emerald-400' : 'text-stone-200'}>
                {challenge.currentProgress} / {challenge.targetProgress} {challenge.unit}
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  challenge.isUnlocked
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-emerald-600/70'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((challenge.currentProgress / challenge.targetProgress) * 100))}%`
                }}
              />
            </div>
          </div>

          {challenge.unlockedDate && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/90 font-medium pt-1">
              <Calendar className="w-3.5 h-3.5" />
              Débloqué avec succès le {new Date(challenge.unlockedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          {challenge.isUnlocked ? (
            <button
              onClick={triggerCelebration}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Célébrer l'Accomplissement 🎉
            </button>
          ) : challenge.actionCta ? (
            <button
              onClick={() => {
                onClose();
                if (onNavigateAction) {
                  onNavigateAction(challenge.actionCta?.tab, challenge.actionCta?.actionKey);
                }
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
            >
              <span>{challenge.actionCta.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold text-xs rounded-2xl border border-stone-800 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
