import { SocialAdDraft, PlantLog, Plant } from '../types';

export async function renderAdToCanvas(
  canvas: HTMLCanvasElement,
  draft: SocialAdDraft,
  plant: Plant,
  beforeLog?: PlantLog,
  afterLog?: PlantLog
): Promise<string> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Determine canvas dimensions based on platform
  let width = 1080;
  let height = 1080;

  switch (draft.platform) {
    case 'instagram_story':
    case 'tiktok':
      width = 1080;
      height = 1920;
      break;
    case 'pinterest_pin':
      width = 1000;
      height = 1500;
      break;
    case 'twitter_card':
      width = 1200;
      height = 675;
      break;
    case 'facebook_feed':
      width = 1080;
      height = 1350; // 4:5 vertical
      break;
    case 'instagram_post':
    default:
      width = 1080;
      height = 1080;
      break;
  }

  canvas.width = width;
  canvas.height = height;

  // Background Theme Palette
  let bgGradientStart = '#132e21';
  let bgGradientEnd = '#0b1c14';
  let accentColor = '#22c55e';
  let textColor = '#ffffff';
  let bannerBg = 'rgba(34, 197, 94, 0.9)';
  let bannerTextColor = '#052e16';

  if (draft.theme === 'minimalist_clay') {
    bgGradientStart = '#f5f0eb';
    bgGradientEnd = '#e6ded4';
    accentColor = '#b45309';
    textColor = '#292524';
    bannerBg = '#292524';
    bannerTextColor = '#ffffff';
  } else if (draft.theme === 'emerald_luxury') {
    bgGradientStart = '#064e3b';
    bgGradientEnd = '#022c22';
    accentColor = '#fbbf24';
    textColor = '#ffffff';
    bannerBg = '#fbbf24';
    bannerTextColor = '#022c22';
  } else if (draft.theme === 'modern_pastel') {
    bgGradientStart = '#ecfdf5';
    bgGradientEnd = '#d1fae5';
    accentColor = '#059669';
    textColor = '#064e3b';
    bannerBg = '#059669';
    bannerTextColor = '#ffffff';
  } else if (draft.theme === 'dark_neon_forest') {
    bgGradientStart = '#0a0a0f';
    bgGradientEnd = '#051b11';
    accentColor = '#10b981';
    textColor = '#f8fafc';
    bannerBg = '#10b981';
    bannerTextColor = '#022c22';
  }

  // Draw background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, bgGradientStart);
  bgGrad.addColorStop(1, bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper to load image
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback placeholder image
        const placeholder = new Image();
        placeholder.src = 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80';
        placeholder.onload = () => resolve(placeholder);
        placeholder.onerror = () => resolve(img);
      };
      img.src = url;
    });
  };

  const afterImgUrl = afterLog?.photoUrl || plant.coverImage;
  const beforeImgUrl = beforeLog?.photoUrl || plant.coverImage;

  try {
    const afterImg = await loadImage(afterImgUrl);
    const beforeImg = await loadImage(beforeImgUrl);

    // Image frame coordinates
    const imgPadding = width * 0.05;
    const headerHeight = height * 0.16;
    const footerHeight = height * 0.22;
    const imgX = imgPadding;
    const imgY = headerHeight;
    const imgW = width - imgPadding * 2;
    const imgH = height - headerHeight - footerHeight;

    // Draw rounded clipping area for images
    ctx.save();
    ctx.beginPath();
    const radius = 24;
    ctx.roundRect(imgX, imgY, imgW, imgH, radius);
    ctx.clip();

    if (draft.showBeforeAfterSplit && beforeLog && afterLog && beforeLog.id !== afterLog.id) {
      // Split view
      const splitX = imgX + imgW * (draft.splitPosition / 100);

      // Draw Before (Left side)
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, imgY, splitX - imgX, imgH);
      ctx.clip();
      drawImageProp(ctx, beforeImg, imgX, imgY, imgW, imgH);
      ctx.restore();

      // Draw After (Right side)
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, imgY, imgX + imgW - splitX, imgH);
      ctx.clip();
      drawImageProp(ctx, afterImg, imgX, imgY, imgW, imgH);
      ctx.restore();

      // Draw divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(splitX, imgY);
      ctx.lineTo(splitX, imgY + imgH);
      ctx.stroke();

      // Draw slider handle circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(splitX, imgY + imgH / 2, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⇆', splitX, imgY + imgH / 2);

      // Draw "AVANT" badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.roundRect(imgX + 20, imgY + 20, 140, 44, 10);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`AVANT • ${formatDateShort(beforeLog.date)}`, imgX + 30, imgY + 48);

      // Draw "APRÈS" badge
      ctx.fillStyle = accentColor;
      const apresW = 160;
      ctx.roundRect(imgX + imgW - apresW - 20, imgY + 20, apresW, 44, 10);
      ctx.fill();
      ctx.fillStyle = bannerTextColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`APRÈS • ${formatDateShort(afterLog.date)}`, imgX + imgW - 30, imgY + 48);

    } else {
      // Single showcase image
      drawImageProp(ctx, afterImg, imgX, imgY, imgW, imgH);
    }

    ctx.restore(); // Restore clipping

    // Draw Header (Shop Name & Promo Banner)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Promo banner text if present
    if (draft.promotionalBannerText) {
      ctx.fillStyle = bannerBg;
      ctx.beginPath();
      ctx.roundRect(width * 0.1, 24, width * 0.8, 48, 24);
      ctx.fill();

      ctx.fillStyle = bannerTextColor;
      ctx.font = 'bold 22px Outfit, sans-serif';
      ctx.fillText(draft.promotionalBannerText.toUpperCase(), width / 2, 36);
    }

    // Shop / Brand Name & Headline
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText(draft.shopName || 'BOTANICATRACK', width / 2, 85);

    ctx.font = '500 24px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(draft.headline || `${plant.name} • Évolution Botanique`, width / 2, 130);

    // Stats badge overlay (if enabled)
    if (draft.showStatsBadge && beforeLog && afterLog) {
      const heightDelta = (afterLog.heightCm || 0) - (beforeLog.heightCm || 0);
      const daysDiff = Math.max(1, Math.round((new Date(afterLog.date).getTime() - new Date(beforeLog.date).getTime()) / (1000 * 3600 * 24)));
      
      const badgeW = 280;
      const badgeH = 75;
      const badgeX = imgX + 24;
      const badgeY = imgY + imgH - badgeH - 24;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const deltaText = heightDelta > 0 ? `+${heightDelta} cm` : `+${afterLog.leafCount || 1} feuilles`;
      ctx.fillText(`🚀 ${deltaText} en ${daysDiff}j`, badgeX + 16, badgeY + 28);

      ctx.font = '500 16px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText(`Score Santé : ${afterLog.healthScore || 95}/100 ✨`, badgeX + 16, badgeY + 54);
      ctx.restore();
    }

    // Draw Footer (CTA & Discount & Price Tag)
    const footerStartY = height - footerHeight + 15;
    ctx.textAlign = 'center';

    // Hookline
    ctx.fillStyle = textColor;
    ctx.font = '600 22px Plus Jakarta Sans, sans-serif';
    ctx.fillText(draft.hookLine || 'Transformez vos plantes grâce à un suivi précis !', width / 2, footerStartY);

    // CTA Button
    const ctaW = Math.min(width * 0.7, 480);
    const ctaH = 64;
    const ctaX = (width - ctaW) / 2;
    const ctaY = footerStartY + 45;

    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 32);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = bannerTextColor;
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText((draft.ctaText || 'DÉCOUVRIR LE GUIDE & PROMOS').toUpperCase(), width / 2, ctaY + ctaH / 2);

    // Code promo & price tag
    if (draft.discountCode || draft.priceTag) {
      ctx.fillStyle = textColor;
      ctx.font = '600 18px Plus Jakarta Sans, sans-serif';
      ctx.textBaseline = 'bottom';
      const promoInfo = [draft.discountCode ? `Code : ${draft.discountCode}` : '', draft.priceTag ? `Dès ${draft.priceTag}` : '']
        .filter(Boolean)
        .join(' • ');
      ctx.fillText(promoInfo, width / 2, height - 20);
    }

  } catch (err) {
    console.error('Error drawing ad canvas:', err);
  }

  return canvas.toDataURL('image/png');
}

// Draw image covering bounds nicely (aspect fit/cover)
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetX: number = 0.5,
  offsetY: number = 0.5
) {
  if (w <= 0 || h <= 0 || !img.width || !img.height) return;

  const nw = img.width;
  const nh = img.height;
  const cw = w;
  const ch = h;
  const cx = x;
  const cy = y;

  let renderW = cw;
  let renderH = ch;
  let sx = 0;
  let sy = 0;
  let sWidth = nw;
  let sHeight = nh;

  const r = Math.max(cw / nw, ch / nh);
  sWidth = cw / r;
  sHeight = ch / r;
  sx = (nw - sWidth) * offsetX;
  sy = (nh - sHeight) * offsetY;

  ctx.drawImage(img, sx, sy, sWidth, sHeight, cx, cy, renderW, renderH);
}

function formatDateShort(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}
