import React from 'react';
import { KartState, KillFeedEvent, GameMode } from '../types';
import { Volume2, VolumeX, Pause, Play, HelpCircle, Trophy, Flame } from 'lucide-react';

interface ScoreboardHUDProps {
  karts: KartState[];
  matchTimeRemaining: number;
  gameMode: GameMode;
  smashGoal: number;
  killFeed: KillFeedEvent[];
  isPaused: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenControls: () => void;
}

export const ScoreboardHUD: React.FC<ScoreboardHUDProps> = ({
  karts,
  matchTimeRemaining,
  gameMode,
  smashGoal,
  killFeed,
  isPaused,
  isMuted,
  onToggleMute,
  onTogglePause,
  onOpenControls,
}) => {
  // Sort karts by smashes descending, then score
  const sortedKarts = [...karts].sort((a, b) => {
    if (b.smashes !== a.smashes) return b.smashes - a.smashes;
    return b.score - a.score;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getPowerIcon = (power: string | null) => {
    switch (power) {
      case 'rocket': return '🚀';
      case 'nitro': return '⚡';
      case 'shield': return '🛡️';
      case 'bomb': return '💣';
      case 'freeze': return '❄️';
      case 'spikes': return '🌀';
      case 'oil': return '🍌';
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between select-none">
      {/* Top Bar Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Match Target & Timer Center Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-950/90 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 shadow-2xl flex items-center gap-3 pointer-events-auto">
            <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-widest text-indigo-300 font-black">
                {gameMode === 'smash_race' ? 'Goal' : 'Time Left'}
              </div>
              <div className="text-base sm:text-lg font-black text-white font-['Fredoka']">
                {gameMode === 'smash_race' 
                  ? `First to ${smashGoal} Smashes` 
                  : formatTime(matchTimeRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* Live Mini Player Score Cards */}
        <div className="hidden md:flex items-center gap-2">
          {sortedKarts.map((k, idx) => {
            const powerIcon = getPowerIcon(k.currentPower);
            const isLeader = idx === 0 && k.smashes > 0;
            return (
              <div
                key={k.id}
                className={`bg-indigo-950/90 backdrop-blur-md border rounded-2xl px-3 py-1.5 shadow-xl flex items-center gap-2.5 transition-all ${
                  isLeader 
                    ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50' 
                    : 'border-white/10'
                }`}
              >
                {/* Color Dot & Rank */}
                <div 
                  className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[9px] font-black text-white shadow-inner"
                  style={{ backgroundColor: k.color }}
                >
                  {idx + 1}
                </div>

                {/* Name & HP */}
                <div className="min-w-[70px]">
                  <div className="text-xs font-bold text-white truncate max-w-[85px] flex items-center gap-1">
                    {k.config.isBot && <span className="text-[10px] opacity-75">🤖</span>}
                    {k.config.name}
                  </div>
                  {/* HP bar */}
                  <div className="w-full bg-indigo-950 h-1.5 rounded-full overflow-hidden mt-0.5 border border-white/10">
                    <div 
                      className={`h-full transition-all duration-150 ${
                        k.hp > 50 ? 'bg-emerald-400' : k.hp > 25 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(0, (k.hp / k.maxHp) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Smashes Count */}
                <div className="flex items-center gap-0.5 text-xs font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-lg border border-amber-400/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{k.smashes}</span>
                </div>

                {/* Power Item if held */}
                {powerIcon && (
                  <div className="text-sm animate-bounce" title={k.currentPower || ''}>
                    {powerIcon}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Utility Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenControls}
            className="w-10 h-10 rounded-2xl bg-indigo-900/80 hover:bg-indigo-800 border border-white/10 text-indigo-200 hover:text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
            title="Controls Guide"
            aria-label="Controls Guide"
          >
            <HelpCircle className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-2xl bg-indigo-900/80 hover:bg-indigo-800 border border-white/10 text-indigo-200 hover:text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
          <button
            onClick={onTogglePause}
            className="w-10 h-10 rounded-2xl bg-indigo-900/80 hover:bg-indigo-800 border border-white/10 text-indigo-200 hover:text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
            title={isPaused ? 'Resume Match' : 'Pause Match'}
            aria-label={isPaused ? 'Resume Match' : 'Pause Match'}
          >
            {isPaused ? <Play className="w-5 h-5 text-amber-400" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Killfeed Notifications in Top-Right under header */}
      <div className="absolute top-16 right-5 flex flex-col gap-1.5 items-end">
        {killFeed.map((event) => (
          <div
            key={event.id}
            className="bg-indigo-950/90 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200"
          >
            <span style={{ color: event.attackerColor }}>{event.attackerName}</span>
            <span className="text-indigo-300 text-[11px]">
              smashed {event.powerUsed ? `with ${getPowerIcon(event.powerUsed) || ''}` : '💥'}
            </span>
            <span style={{ color: event.victimColor }}>{event.victimName}</span>
          </div>
        ))}
      </div>

      {/* Mobile Top Score list (compact) */}
      <div className="flex md:hidden flex-wrap gap-1.5 mt-2">
        {sortedKarts.slice(0, 4).map((k) => (
          <div 
            key={k.id}
            className="bg-indigo-950/90 border border-white/10 rounded-xl px-2.5 py-1 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg"
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: k.color }} />
            <span className="truncate max-w-[55px]">{k.config.name}</span>
            <span className="text-amber-400">{k.smashes}🔥</span>
          </div>
        ))}
      </div>
    </div>
  );
};
