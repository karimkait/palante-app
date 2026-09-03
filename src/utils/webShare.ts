/**
 * Helper utility for Web Share API with native image & file sharing support.
 */

export interface ShareAdOptions {
  dataUrl?: string;
  blob?: Blob;
  title: string;
  text: string;
  url?: string;
  filename?: string;
}

export interface ShareResult {
  success: boolean;
  sharedWithFile: boolean;
  cancelled?: boolean;
  error?: string;
}

/**
 * Checks if the Web Share API is available in the current browser environment.
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Converts a Base64/DataURL to a File object.
 */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const mimeType = blob.type || 'image/png';
  return new File([blob], filename, { type: mimeType });
}

/**
 * Checks if the browser supports sharing specific files via Web Share Level 2.
 */
export function canShareFiles(files: File[]): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare) {
    return false;
  }
  try {
    return navigator.canShare({ files });
  } catch (e) {
    return false;
  }
}

/**
 * Shares an image ad via native Web Share API to mobile apps (WhatsApp, Instagram, Twitter, etc.).
 */
export async function shareAdImage(options: ShareAdOptions): Promise<ShareResult> {
  const { dataUrl, blob, title, text, url, filename = 'botanica-ad-evolution.png' } = options;

  if (!isWebShareSupported()) {
    return {
      success: false,
      sharedWithFile: false,
      error: "L'API de partage n'est pas supportée sur ce navigateur."
    };
  }

  let fileToShare: File | null = null;

  try {
    if (blob) {
      fileToShare = new File([blob], filename, { type: blob.type || 'image/png' });
    } else if (dataUrl) {
      fileToShare = await dataUrlToFile(dataUrl, filename);
    }
  } catch (err) {
    console.warn('Erreur lors de la préparation du fichier pour le partage:', err);
  }

  // Attempt 1: Share with native image File attached
  if (fileToShare && canShareFiles([fileToShare])) {
    try {
      const shareData: ShareData = {
        title,
        text,
        files: [fileToShare]
      };
      if (url) {
        shareData.url = url;
      }

      await navigator.share(shareData);
      return { success: true, sharedWithFile: true };
    } catch (err: any) {
      // If user cancelled the share dialog, do not treat as an error
      if (err.name === 'AbortError') {
        return { success: false, sharedWithFile: true, cancelled: true };
      }
      console.warn('Échec du partage avec fichier, tentative de repli en texte:', err);
    }
  }

  // Attempt 2: Fallback to sharing text / link without the file
  try {
    const fallbackData: ShareData = {
      title,
      text
    };
    if (url) {
      fallbackData.url = url;
    }

    await navigator.share(fallbackData);
    return { success: true, sharedWithFile: false };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, sharedWithFile: false, cancelled: true };
    }
    return {
      success: false,
      sharedWithFile: false,
      error: err.message || 'Erreur lors du partage.'
    };
  }
}
