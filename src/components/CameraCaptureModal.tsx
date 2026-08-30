import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Upload, X, Check, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (base64Photo: string, triggerAiDiagnostic?: boolean) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  title = 'Prendre une photo de plante'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [withAiCheck, setWithAiCheck] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Accès caméra non disponible ou refusé. Vous pouvez téléverser un fichier photo ci-dessous.');
      setActiveTab('upload');
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera(facingMode);
    } else if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, activeTab, facingMode]);

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flash visual effect
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCapturedPhoto(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onPhotoCaptured(capturedPhoto, withAiCheck);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedPhoto(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-[#141614] rounded-3xl shadow-2xl overflow-hidden border border-stone-800 text-stone-100"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#181b18]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-stone-100 text-lg font-['Outfit',sans-serif]">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-stone-400 hover:text-stone-200 rounded-full hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          {!capturedPhoto && (
            <div className="flex p-2 bg-[#181b18] border-b border-stone-800 gap-2">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'camera'
                    ? 'bg-emerald-950 text-emerald-300 shadow-sm border border-emerald-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                Appareil Photo en direct
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-emerald-950 text-emerald-300 shadow-sm border border-emerald-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                Importer une Photo
              </button>
            </div>
          )}

          {/* Main Content Area */}
          <div className="p-6">
            {capturedPhoto ? (
              /* Photo Preview Screen */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-950 border border-stone-800 shadow-inner">
                  <img
                    src={capturedPhoto}
                    alt="Photo capturée"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" /> Photo prête
                  </div>
                </div>

                {/* AI Diagnostic Checkbox option */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-200">Diagnostic IA automatique</p>
                      <p className="text-xs text-emerald-400/90">Identifier l'espèce, évaluer la santé & les progrès</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withAiCheck}
                      onChange={(e) => setWithAiCheck(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCapturedPhoto(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-stone-800 text-stone-300 hover:bg-stone-900 font-medium text-sm transition-colors"
                  >
                    Reprendre la photo
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 border border-emerald-500/30"
                  >
                    Valider & Continuer
                  </button>
                </div>
              </div>
            ) : activeTab === 'camera' ? (
              /* Live Camera Feed */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-950 flex items-center justify-center shadow-inner border border-stone-800">
                  {cameraError ? (
                    <div className="p-6 text-center text-stone-300 space-y-3">
                      <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                      <p className="text-sm">{cameraError}</p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl border border-emerald-500/30"
                      >
                        Sélectionner une photo depuis vos fichiers
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Grid helper overlay */}
                      <div className="absolute inset-0 border border-white/10 pointer-events-none grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-b border-white/15"></div>
                        <div className="border-r border-b border-white/15"></div>
                        <div className="border-b border-white/15"></div>
                        <div className="border-r border-b border-white/15"></div>
                        <div className="border-r border-b border-white/15"></div>
                        <div className="border-b border-white/15"></div>
                      </div>

                      {/* Flash overlay */}
                      {isFlashActive && (
                        <div className="absolute inset-0 bg-white opacity-90 transition-opacity"></div>
                      )}

                      {/* Floating Switch Camera button */}
                      <button
                        onClick={switchCamera}
                        title="Changer de caméra"
                        className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-black text-white rounded-full backdrop-blur-md transition-all shadow-md border border-white/10"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Shutter Button */}
                {!cameraError && (
                  <div className="flex items-center justify-center pt-2">
                    <button
                      onClick={takeSnapshot}
                      className="group relative w-18 h-18 rounded-full border-4 border-emerald-500 bg-stone-900 p-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    >
                      <div className="w-full h-full rounded-full bg-emerald-600 group-hover:bg-emerald-500 transition-colors flex items-center justify-center text-white">
                        <Camera className="w-6 h-6" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* File Upload Zone */
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-800 hover:border-emerald-500/80 rounded-2xl p-8 text-center cursor-pointer bg-[#1a1e1a]/60 hover:bg-[#1e231e] transition-all space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center shadow-sm border border-emerald-500/30">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-stone-100">Glissez-déposez une photo de votre plante</p>
                    <p className="text-xs text-stone-400 mt-1">Formats acceptés : JPG, PNG, WEBP (jusqu'à 10 Mo)</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#141614] border border-stone-800 text-stone-200 text-xs font-semibold rounded-xl shadow-sm hover:bg-stone-900 transition-colors"
                  >
                    Parcourir les fichiers
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
