import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Settings as SettingsIcon, Volume2, Eye, Keyboard, X, Music, MousePointer } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings } = useStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/suprgo-logo-transparent.png"
              alt="SuprGo"
              className="h-10 w-auto object-contain drop-shadow"
            />
            <div>
              <h2 className="text-base font-bold text-white">Store Settings & Music</h2>
              <p className="text-xs text-slate-400">Configure background music, cursor & controls</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Audio & Music Settings */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
              <Music className="w-4 h-4" />
              <span>Supermarket Music & Sound</span>
            </div>
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
              {/* Soothing Background Music Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-purple-400" />
                    <span>Soothing Supermarket Music</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Calming Rhodes electric piano & warm lounge chords</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                />
              </div>

              {settings.musicEnabled && (
                <div className="space-y-1.5 pt-1 pl-5 border-l-2 border-purple-500/30">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Music Volume</span>
                    <span className="font-bold text-purple-400">{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              )}

              {/* Sound Effects SFX */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Sound Effects (SFX)</div>
                  <div className="text-[11px] text-slate-400">Door chimes, pickup pops, conveyor & barcode beeps</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {settings.soundEnabled && (
                <div className="space-y-1.5 pt-1 pl-5 border-l-2 border-cyan-500/30">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>SFX Volume</span>
                    <span className="font-bold text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sfxVolume}
                    onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mouse Cursor & Navigation Comfort */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
              <MousePointer className="w-4 h-4" />
              <span>Smart Cursor & Controls</span>
            </div>
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Automatic Cursor Switching:</strong> Mouse cursor automatically turns <strong className="text-emerald-400">ON</strong> during bill payment, conveyor scanning, catalog browsing, and modal interactions. Click into the 3D scene or press <strong className="text-cyan-400">[Alt]</strong> anytime to toggle.
                </div>
              </div>
            </div>
          </div>

          {/* Graphics & View Settings */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
              <Eye className="w-4 h-4" />
              <span>Graphics & Visual Comfort</span>
            </div>
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Dynamic Real-time Shadows</div>
                  <div className="text-[11px] text-slate-400">PBR directional shadows for shelves & items</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shadows}
                  onChange={(e) => updateSettings({ shadows: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">First-Person Head Bob</div>
                  <div className="text-[11px] text-slate-400">Natural walking camera motion</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.headBob}
                  onChange={(e) => updateSettings({ headBob: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Cheat Sheet */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
              <Keyboard className="w-4 h-4" />
              <span>Controls & Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Walk</span>
                <span className="font-mono text-cyan-300 font-bold">W / A / S / D</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Toggle Cursor</span>
                <span className="font-mono text-cyan-300 font-bold">Alt</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Catalog Mode</span>
                <span className="font-mono text-purple-300 font-bold">Tab</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Pick Item / Pay</span>
                <span className="font-mono text-cyan-300 font-bold">E</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Inspect 3D Product</span>
                <span className="font-mono text-cyan-300 font-bold">F</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Search Products</span>
                <span className="font-mono text-cyan-300 font-bold">Q</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Shopping List</span>
                <span className="font-mono text-cyan-300 font-bold">L</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Shopping Trolley</span>
                <span className="font-mono text-cyan-300 font-bold">C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
