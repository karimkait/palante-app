import React, { useState, useEffect, useRef } from 'react';
import { Plant, PlantLog, SocialPlatform, AdObjective, AdTheme, SocialAdDraft } from '../types';
import { renderAdToCanvas } from '../utils/canvasExport';
import { shareAdImage, isWebShareSupported } from '../utils/webShare';
import { recordAdCreated } from '../utils/challenges';
import {
  Sparkles,
  Download,
  Share2,
  Copy,
  Check,
  Smartphone,
  Instagram,
  Facebook,
  Eye,
  Sliders,
  Palette,
  Tag,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialAdStudioProps {
  plants: Plant[];
  initialPlantId?: string;
  initialBeforeLogId?: string;
  initialAfterLogId?: string;
  onSelectPlant?: (plantId: string) => void;
}

export const SocialAdStudio: React.FC<SocialAdStudioProps> = ({
  plants,
  initialPlantId,
  initialBeforeLogId,
  initialAfterLogId
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    initialPlantId || plants[0]?.id || ''
  );

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || plants[0];

  const sortedLogs = selectedPlant ? [...selectedPlant.logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  ) : [];

  const defaultBeforeLogId = initialBeforeLogId || sortedLogs[0]?.id || '';
  const defaultAfterLogId = initialAfterLogId || sortedLogs[sortedLogs.length - 1]?.id || '';

  const [beforeLogId, setBeforeLogId] = useState<string>(defaultBeforeLogId);
  const [afterLogId, setAfterLogId] = useState<string>(defaultAfterLogId);

  // Sync when selected plant changes
  useEffect(() => {
    if (selectedPlant && sortedLogs.length > 0) {
      if (!sortedLogs.some((l) => l.id === beforeLogId)) {
        setBeforeLogId(sortedLogs[0]?.id || '');
      }
      if (!sortedLogs.some((l) => l.id === afterLogId)) {
        setAfterLogId(sortedLogs[sortedLogs.length - 1]?.id || '');
      }
    }
  }, [selectedPlantId]);

  const beforeLog = sortedLogs.find((l) => l.id === beforeLogId) || sortedLogs[0];
  const afterLog = sortedLogs.find((l) => l.id === afterLogId) || sortedLogs[sortedLogs.length - 1];

  const daysDifference = beforeLog && afterLog
    ? Math.max(1, Math.round((new Date(afterLog.date).getTime() - new Date(beforeLog.date).getTime()) / (1000 * 3600 * 24)))
    : 30;

  const heightDelta = afterLog && beforeLog ? (afterLog.heightCm || 0) - (beforeLog.heightCm || 0) : 0;

  // Social Ad Configuration Draft
  const [draft, setDraft] = useState<SocialAdDraft>({
    platform: 'instagram_post',
    theme: 'botanical_fresh',
    objective: 'pub_vente',
    shopName: 'Mon Jardin Urbain',
    headline: `${selectedPlant?.name || 'Monstera'} • Évolution Spectaculaire`,
    hookLine: `Regardez cette transformation en ${daysDifference} jours seulement ! 🌿✨`,
    caption: `Incroyable métamorphose de notre ${selectedPlant?.name || 'plante'} ! 🪴💚\n\nEn appliquant notre routine d'arrosage et nos fertilisants naturels, elle a gagné ${heightDelta > 0 ? `+${heightDelta}cm` : 'une vitalité folle'}.\n\n👉 Envie de faire pousser vos plantes aussi vite ? Profitez de -15% sur tous nos soins et boutures avec le code VERT15 !`,
    ctaText: 'Commander mon kit bouture -15%',
    hashtags: [
      '#PlantEvolution',
      '#UrbanJungle',
      '#BotanicaTrack',
      '#PlantesVertes',
      '#BeforeAfterPlant',
      '#GreenThumb',
      '#PlantLovers'
    ],
    promotionalBannerText: 'OFFRE LIMITÉE : -15% AVEC LE CODE VERT15 🌱',
    discountCode: 'VERT15',
    priceTag: '14,90€',
    badgeText: 'AVANT / APRÈS VÉRIFIÉ',
    showStatsBadge: true,
    showBeforeAfterSplit: true,
    splitPosition: 50
  });

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string>('');
  const [showFeedPreviewModal, setShowFeedPreviewModal] = useState(false);
  const [customOfferInput, setCustomOfferInput] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareToast, setShareToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const isNativeShareAvailable = isWebShareSupported();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render canvas whenever draft or selected logs change
  useEffect(() => {
    if (!canvasRef.current || !selectedPlant) return;

    let isMounted = true;
    renderAdToCanvas(canvasRef.current, draft, selectedPlant, beforeLog, afterLog).then((dataUrl) => {
      if (isMounted) {
        setRenderedImageUrl(dataUrl);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [draft, selectedPlant, beforeLog, afterLog]);

  // AI Ad copywriter generator
  const handleGenerateAiAd = async () => {
    if (!selectedPlant) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/social/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantName: selectedPlant.name,
          scientificName: selectedPlant.scientificName,
          growthDurationDays: daysDifference,
          growthHeightDelta: heightDelta > 0 ? heightDelta : undefined,
          objective: draft.objective,
          platform: draft.platform.split('_')[0],
          customOffer: customOfferInput || undefined,
          shopName: draft.shopName
        })
      });

      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();

      setDraft((prev) => ({
        ...prev,
        headline: data.title || prev.headline,
        hookLine: data.hookLine || prev.hookLine,
        caption: data.caption || prev.caption,
        ctaText: data.cta || prev.ctaText,
        hashtags: data.hashtags || prev.hashtags,
        promotionalBannerText: data.promotionalBannerText || prev.promotionalBannerText,
        discountCode: data.suggestedDiscountOrOffer || prev.discountCode,
        badgeText: data.adBadgeText || prev.badgeText
      }));

      // Trigger small festive confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Erreur génération IA:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Download high-res ad image
  const handleDownloadImage = () => {
    if (!renderedImageUrl) return;
    const a = document.createElement('a');
    a.href = renderedImageUrl;
    a.download = `BotanicaAd_${selectedPlant.name.replace(/\s+/g, '_')}_${draft.platform}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });

    recordAdCreated();

    setShareToast({
      message: "Image PNG téléchargée avec succès !",
      type: 'success'
    });
    setTimeout(() => setShareToast(null), 3000);
  };

  // Copy caption and hashtags
  const handleCopyCaption = () => {
    const fullText = `${draft.hookLine}\n\n${draft.caption}\n\n${draft.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setShareToast({
      message: "Légende et hashtags copiés dans le presse-papier !",
      type: 'success'
    });
    setTimeout(() => {
      setCopiedText(false);
      setShareToast(null);
    }, 3000);
  };

  // Share via Web Share API Level 2 (with direct image file support)
  const handleShare = async () => {
    if (!renderedImageUrl) return;

    // If browser supports Web Share API
    if (isNativeShareAvailable) {
      setIsSharing(true);
      setShareToast(null);

      const filename = `BotanicaAd_${selectedPlant.name.replace(/\s+/g, '_')}_${draft.platform}.png`;
      const fullText = `${draft.hookLine}\n\n${draft.caption}\n\n${draft.hashtags.join(' ')}`;

      try {
        const result = await shareAdImage({
          dataUrl: renderedImageUrl,
          title: draft.headline,
          text: fullText,
          filename
        });

        if (result.success) {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 }
          });
          recordAdCreated();
          setShareToast({
            message: result.sharedWithFile
              ? "Image et texte partagés avec succès !"
              : "Texte publicitaire partagé avec succès !",
            type: 'success'
          });
          setTimeout(() => setShareToast(null), 4000);
          return;
        } else if (result.cancelled) {
          // User closed share sheet without completing
          return;
        } else {
          // Web Share failed with specific error, fallback to preview simulation
          setShowFeedPreviewModal(true);
        }
      } catch (err) {
        console.error('Erreur Web Share:', err);
        setShowFeedPreviewModal(true);
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback for browsers / desktops without navigator.share
      setShowFeedPreviewModal(true);
      setShareToast({
        message: "Partage direct non supporté sur ce navigateur. Utilisez le téléchargement ou la copie.",
        type: 'info'
      });
      setTimeout(() => setShareToast(null), 4000);
    }
  };

  const platformsList: { id: SocialPlatform; name: string; icon: any; aspect: string; size: string }[] = [
    { id: 'instagram_post', name: 'Instagram Post', icon: Instagram, aspect: '1:1', size: '1080 x 1080' },
    { id: 'instagram_story', name: 'Story / TikTok', icon: Smartphone, aspect: '9:16', size: '1080 x 1920' },
    { id: 'facebook_feed', name: 'Facebook Ad', icon: Facebook, aspect: '4:5', size: '1080 x 1350' },
    { id: 'pinterest_pin', name: 'Pinterest Pin', icon: Tag, aspect: '2:3', size: '1000 x 1500' },
    { id: 'twitter_card', name: 'X / Twitter Banner', icon: Share2, aspect: '16:9', size: '1200 x 675' }
  ];

  const objectivesList: { id: AdObjective; label: string; desc: string; emoji: string }[] = [
    { id: 'pub_vente', label: 'Publicité Vente & Promo', desc: 'Boutique, vente de boutures & engrais', emoji: '🛍️' },
    { id: 'fierte_evolution', label: 'Showcase Évolution', desc: 'Mise en avant spectaculaire Avant/Après', emoji: '🌱' },
    { id: 'conseil_tuto', label: 'Conseil & Tuto Sponsorisé', desc: 'Astuces de culture & soin des plantes', emoji: '💡' },
    { id: 'concours_engagement', label: 'Concours & Viralité', desc: 'Jeu concours & boost d\'abonnés', emoji: '🎁' },
    { id: 'story_before_after', label: 'Story Interactive', desc: 'Sondage & découverte en slide', emoji: '📱' }
  ];

  const themesList: { id: AdTheme; name: string; colorClass: string }[] = [
    { id: 'botanical_fresh', name: 'Vert Botanique', colorClass: 'bg-emerald-700' },
    { id: 'minimalist_clay', name: 'Terre Cuite & Lin', colorClass: 'bg-amber-700' },
    { id: 'emerald_luxury', name: 'Émeraude & Or', colorClass: 'bg-emerald-950' },
    { id: 'modern_pastel', name: 'Pastel Menthe', colorClass: 'bg-teal-200' },
    { id: 'dark_neon_forest', name: 'Forêt Néon Dark', colorClass: 'bg-stone-950 border border-emerald-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Studio Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-end pr-8">
          <Share2 className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Studio de Publicités & Publications Réseaux Sociaux
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif]">
            Monétisez & Partagez la croissance de vos plantes
          </h2>
          <p className="text-stone-300 text-sm sm:text-base">
            Créez des visuels Avant/Après percutants, générez des accroches et textes publicitaires par IA, et publiez directement sur Instagram, TikTok, Facebook ou Pinterest.
          </p>
        </div>
      </div>

      {/* Main Studio Grid: Left Controls / Right Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Select Plant & Evolution Logs */}
          <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800/80 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-100 text-base font-['Outfit',sans-serif] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 text-xs flex items-center justify-center font-bold border border-emerald-500/30">1</span>
                Plante & Dates d'évolution
              </h3>
              <span className="text-xs text-stone-400 font-medium">
                {daysDifference} jours de progression
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1.5">Plante sélectionnée</label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {plants.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#141614] text-stone-200">
                      {p.name} ({p.logs.length} photos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1.5">Photo "Avant"</label>
                <select
                  value={beforeLogId}
                  onChange={(e) => setBeforeLogId(e.target.value)}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {sortedLogs.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#141614] text-stone-200">
                      {new Date(l.date).toLocaleDateString('fr-FR')} • {l.stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1.5">Photo "Après"</label>
                <select
                  value={afterLogId}
                  onChange={(e) => setAfterLogId(e.target.value)}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {sortedLogs.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#141614] text-stone-200">
                      {new Date(l.date).toLocaleDateString('fr-FR')} • {l.stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split & Stats Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-800 text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                <input
                  type="checkbox"
                  checked={draft.showBeforeAfterSplit}
                  onChange={(e) => setDraft({ ...draft, showBeforeAfterSplit: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-stone-900 border-stone-700"
                />
                <span className="font-medium text-xs">Visuel double Avant/Après scindé</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                <input
                  type="checkbox"
                  checked={draft.showStatsBadge}
                  onChange={(e) => setDraft({ ...draft, showStatsBadge: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-stone-900 border-stone-700"
                />
                <span className="font-medium text-xs">Afficher badge métriques (+{heightDelta > 0 ? heightDelta : 15}cm)</span>
              </label>

              {draft.showBeforeAfterSplit && (
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-xs text-stone-400 font-medium">Position coupe :</span>
                  <input
                    type="range"
                    min="15"
                    max="85"
                    value={draft.splitPosition}
                    onChange={(e) => setDraft({ ...draft, splitPosition: Number(e.target.value) })}
                    className="w-full accent-emerald-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-bold text-stone-300 w-8">{draft.splitPosition}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Select Format & Objective */}
          <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800/80 shadow-md space-y-5">
            <h3 className="font-bold text-stone-100 text-base font-['Outfit',sans-serif] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 text-xs flex items-center justify-center font-bold border border-emerald-500/30">2</span>
              Format Réseau Social & Objectif Publicitaire
            </h3>

            {/* Platform selection pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {platformsList.map((p) => {
                const Icon = p.icon;
                const isSelected = draft.platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setDraft({ ...draft, platform: p.id })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-200 shadow-sm'
                        : 'border-stone-800 hover:border-stone-700 text-stone-300 bg-[#1a1e1a]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                        {p.aspect}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-100">{p.name}</p>
                    <p className="text-[10px] text-stone-400">{p.size}</p>
                  </button>
                );
              })}
            </div>

            {/* Objective Selection */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Objectif de la publication</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {objectivesList.map((obj) => {
                  const isSelected = draft.objective === obj.id;
                  return (
                    <button
                      key={obj.id}
                      onClick={() => setDraft({ ...draft, objective: obj.id })}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-200'
                          : 'border-stone-800 hover:border-stone-700 text-stone-300 bg-[#1a1e1a]/40'
                      }`}
                    >
                      <span className="text-xl">{obj.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-stone-100">{obj.label}</p>
                        <p className="text-[11px] text-stone-400 leading-tight mt-0.5">{obj.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Thème Graphique</label>
              <div className="flex flex-wrap gap-2">
                {themesList.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setDraft({ ...draft, theme: th.id })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      draft.theme === th.id
                        ? 'border-emerald-500 bg-emerald-950 text-emerald-200 shadow-sm'
                        : 'border-stone-800 text-stone-300 bg-[#1a1e1a] hover:bg-stone-800'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${th.colorClass}`}></span>
                    {th.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: AI Copywriter & Marketing Parameters */}
          <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800/80 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-100 text-base font-['Outfit',sans-serif] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 text-xs flex items-center justify-center font-bold border border-emerald-500/30">3</span>
                Contenu Publicitaire & IA Rédactrice
              </h3>
              
              <button
                onClick={handleGenerateAiAd}
                disabled={isGeneratingAi}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-emerald-950/40 transition-all disabled:opacity-50 border border-emerald-500/30"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                {isGeneratingAi ? 'Génération IA en cours...' : 'Générer par IA'}
              </button>
            </div>

            {/* Custom Offer hint for AI */}
            <div className="bg-[#1a1e1a] rounded-2xl p-3.5 border border-stone-800 flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ex: -20% sur la 2e bouture, Offre de rentrée, Pack engrais offert..."
                  value={customOfferInput}
                  onChange={(e) => setCustomOfferInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-stone-200 placeholder-stone-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Nom Marque / Compte</label>
                  <input
                    type="text"
                    value={draft.shopName}
                    onChange={(e) => setDraft({ ...draft, shopName: e.target.value })}
                    className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Code Promo / Réduction</label>
                  <input
                    type="text"
                    value={draft.discountCode}
                    onChange={(e) => setDraft({ ...draft, discountCode: e.target.value })}
                    className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Prix ou Tarif d'appel</label>
                  <input
                    type="text"
                    value={draft.priceTag}
                    onChange={(e) => setDraft({ ...draft, priceTag: e.target.value })}
                    className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Bandeau Promo Visuel</label>
                <input
                  type="text"
                  value={draft.promotionalBannerText}
                  onChange={(e) => setDraft({ ...draft, promotionalBannerText: e.target.value })}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Titre & Phrase d'accroche (Hook)</label>
                <input
                  type="text"
                  value={draft.hookLine}
                  onChange={(e) => setDraft({ ...draft, hookLine: e.target.value })}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Bouton d'action (CTA)</label>
                <input
                  type="text"
                  value={draft.ctaText}
                  onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-stone-400">Légende complète (Copywriting)</label>
                  <button
                    onClick={handleCopyCaption}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedText ? 'Copié !' : 'Copier texte'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={draft.caption}
                  onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
                  className="w-full bg-[#1a1e1a] border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Hashtags recommandés</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#1a1e1a] rounded-xl border border-stone-800">
                  {draft.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-[11px] font-medium text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Visual Preview & Export Suite (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-[#141614] rounded-3xl p-6 border border-stone-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Aperçu Haute Définition</span>
                <h3 className="font-bold text-stone-100 text-lg font-['Outfit',sans-serif]">Visuel Prêt à Publier</h3>
              </div>
              <button
                onClick={() => setShowFeedPreviewModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 transition-colors border border-stone-800"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                Simulateur Réseau
              </button>
            </div>

            {/* Canvas Preview Container */}
            <div className="relative rounded-2xl overflow-hidden bg-stone-950 shadow-inner flex items-center justify-center p-2 border border-stone-800">
              {renderedImageUrl ? (
                <img
                  src={renderedImageUrl}
                  alt="Aperçu Publicité"
                  className="w-full h-auto rounded-xl object-contain max-h-[480px] shadow-lg"
                />
              ) : (
                <div className="py-20 text-center text-stone-400 text-xs">Génération du visuel...</div>
              )}
            </div>

            {/* Action Buttons: Web Share, Download, Copy, Simulator */}
            <div className="space-y-3">
              {/* Primary Native Web Share Button */}
              <button
                onClick={handleShare}
                disabled={isSharing || !renderedImageUrl}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all flex items-center justify-center gap-2.5 border border-emerald-400/40 disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Préparation du partage...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-emerald-100" />
                    <span>Partager l'image vers vos Apps</span>
                    <span className="text-[10px] bg-emerald-950/70 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                      Mobile & Réseaux
                    </span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownloadImage}
                  disabled={!renderedImageUrl}
                  className="py-3 px-3 bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 border border-stone-800 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Télécharger (PNG)
                </button>

                <button
                  onClick={handleCopyCaption}
                  className="py-3 px-3 border border-stone-800 hover:bg-stone-900 text-stone-300 font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedText ? 'Copié !' : 'Copier Légende'}
                </button>
              </div>
            </div>

            {/* In-app Toast alert for Share Studio */}
            {shareToast && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all animate-fadeIn ${
                  shareToast.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                    : 'bg-stone-900 border border-stone-700 text-stone-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{shareToast.message}</span>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-emerald-950/40 rounded-2xl p-3.5 border border-emerald-500/30 text-xs text-emerald-300 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Partage direct Web Share :
              </p>
              <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                En cliquant sur <strong>Partager</strong>, votre téléphone ouvre directement la sélection d'applications (Instagram, WhatsApp, TikTok, Pinterest, X...) avec le visuel HD et le texte attachés !
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Hidden Canvas for High-Res Output Rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Feed Simulation Modal */}
      {showFeedPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#141614] rounded-3xl shadow-2xl overflow-hidden border border-stone-800">
            {/* Header of Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-[#181b18]">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-400" />
                <span className="font-bold text-stone-200 text-sm">Aperçu en situation (Instagram Sponsorisé)</span>
              </div>
              <button
                onClick={() => setShowFeedPreviewModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-full hover:bg-stone-800"
              >
                ✕
              </button>
            </div>

            {/* Simulated Post Body */}
            <div className="p-4 space-y-3">
              {/* Account header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {draft.shopName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-100 leading-none">{draft.shopName}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Sponsorisé • Plantes & Botanique</p>
                  </div>
                </div>
                <span className="text-stone-400 text-sm">•••</span>
              </div>

              {/* Image Preview */}
              <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-950 shadow-inner">
                {renderedImageUrl && (
                  <img src={renderedImageUrl} alt="Aperçu post" className="w-full h-auto object-cover" />
                )}
              </div>

              {/* Call to Action Bar */}
              <div className="bg-[#1a1e1a] hover:bg-stone-800 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-stone-100 cursor-pointer transition-colors border border-stone-800">
                <span>{draft.ctaText || 'En savoir plus'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>

              {/* Caption Preview */}
              <div className="text-xs text-stone-300 space-y-1">
                <p>
                  <span className="font-bold mr-1 text-stone-100">{draft.shopName}</span>
                  {draft.hookLine}
                </p>
                <p className="text-stone-400 line-clamp-3">{draft.caption}</p>
                <p className="text-emerald-400 font-medium">{draft.hashtags.slice(0, 5).join(' ')}</p>
              </div>

              <div className="pt-3 border-t border-stone-800 flex flex-col gap-2">
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow border border-emerald-500/30 flex items-center justify-center gap-2"
                >
                  {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                  Partager directement vers une application
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadImage}
                    className="py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-medium rounded-xl border border-stone-800 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Télécharger
                  </button>
                  <button
                    onClick={handleCopyCaption}
                    className="py-2 border border-stone-800 text-stone-300 text-xs font-medium rounded-xl hover:bg-stone-900 flex items-center justify-center gap-1.5"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedText ? 'Copié !' : 'Copier Légende'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
