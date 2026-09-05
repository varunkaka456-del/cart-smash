import React from 'react';
import { X, Keyboard, Smartphone, Zap, Sparkles, Trophy } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-indigo-950/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center text-white transform rotate-2">
            <Keyboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-400 font-['Fredoka']">
              Driver Controls Guide
            </h2>
            <p className="text-xs text-indigo-300">
              Multiplayer keyboard assignments & touchscreen mobile gestures
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 border border-white/10 text-indigo-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 4 Players Keyboard Grid */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
          Local Multiplayer Keyboard Controls (1 to 4 Players)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Player 1 */}
          <div className="bg-indigo-900/40 border border-white/10 rounded-3xl p-4 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-cyan-400">Player 1</span>
              <span className="text-[10px] uppercase font-black bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 px-2.5 py-0.5 rounded-full">
                WASD
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drive / Reverse:</span>
                <span className="font-black text-white">W / S</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Steer Left/Right:</span>
                <span className="font-black text-white">A / D</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Use Power:</span>
                <span className="font-black text-amber-400">Space</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drift & Turbo:</span>
                <span className="font-black text-purple-400">Shift</span>
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="bg-indigo-900/40 border border-white/10 rounded-3xl p-4 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-pink-400">Player 2</span>
              <span className="text-[10px] uppercase font-black bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2.5 py-0.5 rounded-full">
                Arrow Keys
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drive / Reverse:</span>
                <span className="font-black text-white">↑ / ↓</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Steer Left/Right:</span>
                <span className="font-black text-white">← / →</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Use Power:</span>
                <span className="font-black text-amber-400">Enter</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drift & Turbo:</span>
                <span className="font-black text-purple-400">Right Ctrl</span>
              </div>
            </div>
          </div>

          {/* Player 3 */}
          <div className="bg-indigo-900/40 border border-white/10 rounded-3xl p-4 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-emerald-400">Player 3</span>
              <span className="text-[10px] uppercase font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                IJKL
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drive / Reverse:</span>
                <span className="font-black text-white">I / K</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Steer Left/Right:</span>
                <span className="font-black text-white">J / L</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Use Power:</span>
                <span className="font-black text-amber-400">U</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drift & Turbo:</span>
                <span className="font-black text-purple-400">O</span>
              </div>
            </div>
          </div>

          {/* Player 4 */}
          <div className="bg-indigo-900/40 border border-white/10 rounded-3xl p-4 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-amber-400">Player 4</span>
              <span className="text-[10px] uppercase font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                TFGH
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drive / Reverse:</span>
                <span className="font-black text-white">T / G</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Steer Left/Right:</span>
                <span className="font-black text-white">F / H</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Use Power:</span>
                <span className="font-black text-amber-400">Y</span>
              </div>
              <div className="flex items-center justify-between bg-indigo-950/80 border border-white/5 px-2.5 py-1.5 rounded-xl">
                <span className="text-indigo-300">Drift & Turbo:</span>
                <span className="font-black text-purple-400">R</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Touch & Mobile Controls info */}
      <div className="bg-indigo-900/40 border border-white/10 rounded-3xl p-4 flex items-center gap-3 shadow-inner">
        <Smartphone className="w-8 h-8 text-pink-400 shrink-0" />
        <div className="text-xs text-indigo-200">
          <strong className="text-white block font-black mb-0.5">Touch Screens & Mobile Support:</strong>
          Virtual on-screen D-Pad, Drifting spark button, and Fire Power buttons appear automatically on touch-enabled screens!
        </div>
      </div>

      {/* Powers Cheat-sheet */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
          Kart Powers & Weapons Guide
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🚀</span>
            <div>
              <strong className="text-white block">Rocket</strong>
              <span className="text-[10px] text-indigo-300">Homing missile hit</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">⚡</span>
            <div>
              <strong className="text-white block">Nitro Turbo</strong>
              <span className="text-[10px] text-indigo-300">Speed ram attack</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🛡️</span>
            <div>
              <strong className="text-white block">Shield</strong>
              <span className="text-[10px] text-indigo-300">Blocks incoming hits</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">💣</span>
            <div>
              <strong className="text-white block">Mega Bomb</strong>
              <span className="text-[10px] text-indigo-300">Huge blast radius</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">❄️</span>
            <div>
              <strong className="text-white block">Frost Ray</strong>
              <span className="text-[10px] text-indigo-300">Freezes opponent</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🌀</span>
            <div>
              <strong className="text-white block">Spikes</strong>
              <span className="text-[10px] text-indigo-300">Whirling saws</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🍌</span>
            <div>
              <strong className="text-white block">Oil Slick</strong>
              <span className="text-[10px] text-indigo-300">Causes 720° spin</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🌩️</span>
            <div>
              <strong className="text-white block">Thunderbolt</strong>
              <span className="text-[10px] text-indigo-300">Zaps all opponents</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🔨</span>
            <div>
              <strong className="text-white block">Warhammer</strong>
              <span className="text-[10px] text-indigo-300">Giant orbital smash</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🌪️</span>
            <div>
              <strong className="text-white block">Tornado</strong>
              <span className="text-[10px] text-indigo-300">Vortex pulls karts in</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">🔫</span>
            <div>
              <strong className="text-white block">Plasma Laser</strong>
              <span className="text-[10px] text-indigo-300">Ricocheting energy bolt</span>
            </div>
          </div>
          <div className="bg-indigo-900/40 border border-white/10 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-xl">✨</span>
            <div>
              <strong className="text-white block">Mini-Turbo</strong>
              <span className="text-[10px] text-indigo-300">Drift & release boost</span>
            </div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
      >
        Got it, Let&apos;s Smash!
      </button>
    </div>
  );
};
