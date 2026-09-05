import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  hasPower: boolean;
  powerType: string | null;
  onInput: (action: 'forward' | 'backward' | 'left' | 'right' | 'action' | 'drift', active: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  hasPower,
  powerType,
  onInput,
}) => {
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});

  const handleTouch = (action: 'forward' | 'backward' | 'left' | 'right' | 'action' | 'drift', active: boolean) => {
    setActiveKeys(prev => ({ ...prev, [action]: active }));
    onInput(action, active);
  };

  const getPowerEmoji = (type: string | null) => {
    switch (type) {
      case 'rocket': return '🚀';
      case 'nitro': return '⚡';
      case 'shield': return '🛡️';
      case 'bomb': return '💣';
      case 'freeze': return '❄️';
      case 'spikes': return '🌀';
      case 'oil': return '🍌';
      default: return 'FIRE';
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-3 px-4 flex items-end justify-between pointer-events-none select-none z-20">
      {/* Left side: Steering D-Pad */}
      <div className="flex flex-col items-center gap-1 pointer-events-auto">
        <button
          onTouchStart={() => handleTouch('forward', true)}
          onTouchEnd={() => handleTouch('forward', false)}
          onMouseDown={() => handleTouch('forward', true)}
          onMouseUp={() => handleTouch('forward', false)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl active:scale-90 transition-all ${
            activeKeys['forward']
              ? 'bg-emerald-500 border-emerald-300 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'bg-indigo-950/85 border-white/10 text-indigo-200'
          }`}
          aria-label="Drive Forward"
        >
          <ArrowUp className="w-7 h-7" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => handleTouch('left', true)}
            onTouchEnd={() => handleTouch('left', false)}
            onMouseDown={() => handleTouch('left', true)}
            onMouseUp={() => handleTouch('left', false)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl active:scale-90 transition-all ${
              activeKeys['left']
                ? 'bg-pink-500 border-pink-300 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                : 'bg-indigo-950/85 border-white/10 text-indigo-200'
            }`}
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          <button
            onTouchStart={() => handleTouch('backward', true)}
            onTouchEnd={() => handleTouch('backward', false)}
            onMouseDown={() => handleTouch('backward', true)}
            onMouseUp={() => handleTouch('backward', false)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl active:scale-90 transition-all ${
              activeKeys['backward']
                ? 'bg-rose-500 border-rose-300 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-indigo-950/85 border-white/10 text-indigo-200'
            }`}
            aria-label="Reverse or Brake"
          >
            <ArrowDown className="w-7 h-7" />
          </button>

          <button
            onTouchStart={() => handleTouch('right', true)}
            onTouchEnd={() => handleTouch('right', false)}
            onMouseDown={() => handleTouch('right', true)}
            onMouseUp={() => handleTouch('right', false)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl active:scale-90 transition-all ${
              activeKeys['right']
                ? 'bg-pink-500 border-pink-300 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                : 'bg-indigo-950/85 border-white/10 text-indigo-200'
            }`}
            aria-label="Steer Right"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Right side: Drift & Fire Power */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Drift button */}
        <button
          onTouchStart={() => handleTouch('drift', true)}
          onTouchEnd={() => handleTouch('drift', false)}
          onMouseDown={() => handleTouch('drift', true)}
          onMouseUp={() => handleTouch('drift', false)}
          className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shadow-xl active:scale-90 transition-all ${
            activeKeys['drift']
              ? 'bg-purple-600 border-purple-400 text-white ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
              : 'bg-indigo-950/85 border-white/10 text-purple-300'
          }`}
          aria-label="Drift"
        >
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">Drift</span>
        </button>

        {/* Use Power button */}
        <button
          onTouchStart={() => handleTouch('action', true)}
          onTouchEnd={() => handleTouch('action', false)}
          onMouseDown={() => handleTouch('action', true)}
          onMouseUp={() => handleTouch('action', false)}
          disabled={!hasPower}
          className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center border-2 shadow-2xl active:scale-95 transition-all ${
            hasPower
              ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 border-white/30 text-white animate-pulse shadow-[0_0_25px_rgba(236,72,153,0.6)] cursor-pointer'
              : 'bg-indigo-950/60 border-white/5 text-indigo-400 opacity-60 cursor-not-allowed'
          }`}
          aria-label="Use Power"
        >
          {hasPower ? (
            <>
              <span className="text-2xl">{getPowerEmoji(powerType)}</span>
              <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">SMASH</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 text-indigo-400" />
              <span className="text-[9px] font-bold uppercase text-indigo-400">No Item</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
