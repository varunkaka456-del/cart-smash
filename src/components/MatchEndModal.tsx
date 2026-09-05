import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchRecord } from '../types';
import { Trophy, RotateCcw, Home, Sparkles, Flame, ShieldAlert } from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface MatchEndModalProps {
  matchRecord: MatchRecord;
  onRematch: () => void;
  onMainMenu: () => void;
  onOpenHistory: () => void;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  matchRecord,
  onRematch,
  onMainMenu,
  onOpenHistory,
}) => {
  useEffect(() => {
    // Play fanfare sound
    sounds.playFanfare();

    // Trigger confetti cannon
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff2a55', '#00f0ff', '#ffd200', '#00ff66', '#bf00ff'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff2a55', '#00f0ff', '#ffd200', '#00ff66', '#bf00ff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const winner = matchRecord.scoreboard[0];

  return (
    <div className="w-full max-w-2xl mx-auto bg-indigo-950/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col gap-6 animate-in zoom-in-95 duration-200">
      {/* Trophy & Winner Crown Banner */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 p-3 shadow-[0_0_25px_rgba(236,72,153,0.5)] flex items-center justify-center transform rotate-3 animate-bounce">
          <Trophy className="w-9 h-9 text-white" />
        </div>

        <span className="text-xs uppercase font-black tracking-widest text-amber-400 mt-1">
          MATCH FINISHED!
        </span>

        <h2 className="text-3xl sm:text-4xl font-black text-white font-['Fredoka'] flex items-center gap-2">
          <span style={{ color: matchRecord.winnerColor }}>
            {matchRecord.winnerName}
          </span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-400">
            WINS!
          </span>
        </h2>

        {/* 50% Fair Play indicator note */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-900/60 border border-white/10 text-xs text-indigo-200 shadow-inner">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {matchRecord.isWinnerBot
              ? '🤖 Computer victory! (Fair Play 50% Win Rate target)'
              : '🎉 Human victory! (Overcame the 50% computer challenge)'}
          </span>
        </div>
      </div>

      {/* Final Scoreboard Table */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-black uppercase tracking-widest text-indigo-300 px-3 flex justify-between">
          <span>Rank & Driver</span>
          <div className="flex items-center gap-6">
            <span>Smashes</span>
            <span>Damage</span>
            <span>Score</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {matchRecord.scoreboard.map((item, idx) => {
            const isWinner = idx === 0;
            return (
              <div
                key={item.playerId}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isWinner
                    ? 'bg-indigo-900/70 border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'bg-indigo-900/30 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shadow ${
                      idx === 0 ? 'bg-pink-500' : idx === 1 ? 'bg-indigo-700' : idx === 2 ? 'bg-indigo-800' : 'bg-indigo-950'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/50 shadow-inner"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {item.isBot && <span className="text-xs">🤖</span>}
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm font-bold">
                  <span className="text-amber-400 w-12 text-right flex items-center justify-end gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {item.smashes}
                  </span>
                  <span className="text-indigo-200 w-14 text-right">
                    {item.damageDealt}
                  </span>
                  <span className="text-pink-400 w-14 text-right font-black">
                    {item.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          onClick={onRematch}
          className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_10px_20px_rgba(244,63,94,0.4)] hover:translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Rematch
        </button>

        <button
          onClick={onOpenHistory}
          className="py-3.5 px-4 rounded-2xl bg-indigo-800 hover:bg-indigo-700 border border-white/10 text-indigo-100 hover:text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Stats & History
        </button>

        <button
          onClick={onMainMenu}
          className="py-3.5 px-4 rounded-2xl bg-indigo-800 hover:bg-indigo-700 border border-white/10 text-indigo-200 hover:text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Home className="w-4 h-4" />
          Main Menu
        </button>
      </div>
    </div>
  );
};
