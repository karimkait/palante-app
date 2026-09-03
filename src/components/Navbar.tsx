import React from 'react';
import {
  Camera,
  Plus,
  Share2,
  Sparkles,
  Layers,
  Leaf,
  Activity,
  Menu,
  X,
  Bell,
  Droplets,
  TrendingUp,
  Trophy
} from 'lucide-react';

export type AppTab = 'garden' | 'trends' | 'challenges' | 'timeline' | 'ads_studio' | 'ai_doctor';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAddPlant: () => void;
  onQuickSnapPhoto: () => void;
  totalPlantsCount: number;
  wateringAlertCount?: number;
  onOpenWateringNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddPlant,
  onQuickSnapPhoto,
  totalPlantsCount,
  wateringAlertCount = 0,
  onOpenWateringNotifications
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs: { id: AppTab; label: string; icon: any; badge?: string }[] = [
    { id: 'garden', label: 'Mon Jardin', icon: Leaf, badge: totalPlantsCount.toString() },
    { id: 'challenges', label: 'Défis & Badges', icon: Trophy, badge: 'Nouveau' },
    { id: 'trends', label: 'Tendances Globales', icon: TrendingUp },
    { id: 'timeline', label: 'Chronologie & Évolution', icon: Layers },
    { id: 'ads_studio', label: 'Studio Pub Réseaux', icon: Share2, badge: 'IA' },
    { id: 'ai_doctor', label: 'Diagnostic Santé IA', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0e100e]/90 backdrop-blur-md border-b border-stone-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div
            onClick={() => onSelectTab('garden')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform border border-emerald-400/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-stone-100 font-['Outfit',sans-serif] tracking-tight">
                  BotanicaTrack
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium leading-none">
                Suivi de Croissance & Pubs Réseaux
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#141614] p-1.5 rounded-2xl border border-stone-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1e231e] text-emerald-300 shadow-sm border border-emerald-500/30'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Top Quick Actions & Notification Bell */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Watering Notification Bell */}
            <button
              onClick={onOpenWateringNotifications}
              title="Rappels d'arrosage"
              className="relative p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-all"
            >
              <Bell className="w-4 h-4" />
              {wateringAlertCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-[#0e100e] shadow animate-pulse">
                  {wateringAlertCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              onClick={onQuickSnapPhoto}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-bold border border-stone-800 transition-colors shadow-sm"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Prendre Photo</span>
            </button>

            <button
              onClick={onOpenAddPlant}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 hover:shadow-lg transition-all border border-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nouvelle Plante</span>
            </button>
          </div>

          {/* Mobile Menu Toggle & Bell */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenWateringNotifications}
              className="relative p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200"
            >
              <Bell className="w-5 h-5" />
              {wateringAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-extrabold text-[9px] flex items-center justify-center border-2 border-[#0e100e]">
                  {wateringAlertCount}
                </span>
              )}
            </button>
            <button
              onClick={onQuickSnapPhoto}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200"
            >
              <Camera className="w-5 h-5 text-emerald-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-[#101210] px-4 pt-3 pb-6 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#181d18] text-emerald-300 border border-emerald-500/30'
                    : 'text-stone-300 hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold border border-stone-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-stone-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onQuickSnapPhoto();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              Prendre Photo
            </button>
            <button
              onClick={() => {
                onOpenAddPlant();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              + Plante
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
