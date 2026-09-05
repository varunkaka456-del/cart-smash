import React, { useState } from 'react';
import { PlayerConfig, Track, GameMode, CartChassis, TopperType } from '../types';
import { TRACKS, CART_COLORS } from '../game/tracks';
import { Users, Bot, Play, Sparkles, Sliders, ShieldAlert, Car, Crown, HelpCircle } from 'lucide-react';

interface PlayerSetupModalProps {
  onStartGame: (
    players: PlayerConfig[],
    track: Track,
    mode: GameMode,
    smashGoal: number,
    timeLimit: number,
    fairFiftyPercent: boolean
  ) => void;
  onOpenHistory: () => void;
  onOpenControls: () => void;
}

const DEFAULT_CONTROLS = [
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'Space', drift: 'ShiftLeft' },
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', action: 'Enter', drift: 'ControlRight' },
  { up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', action: 'KeyU', drift: 'KeyO' },
  { up: 'KeyT', down: 'KeyG', left: 'KeyF', right: 'KeyH', action: 'KeyY', drift: 'KeyR' },
];

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  onStartGame,
  onOpenHistory,
  onOpenControls,
}) => {
  const [humanCount, setHumanCount] = useState<number>(1);
  const [totalCarts, setTotalCarts] = useState<number>(4);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(TRACKS[0]?.id || 'white_pearl');
  const [gameMode, setGameMode] = useState<GameMode>('smash_race');
  const [smashGoal, setSmashGoal] = useState<number>(5);
  const [timeLimit, setTimeLimit] = useState<number>(90);
  const [fairFiftyPercent, setFairFiftyPercent] = useState<boolean>(true);

  // Player configurations
  const [players, setPlayers] = useState<PlayerConfig[]>([
    {
      id: 'p1',
      name: 'Player 1',
      isBot: false,
      color: CART_COLORS[0].primary,
      secondaryColor: CART_COLORS[0].secondary,
      chassis: 'speedster',
      topper: 'crown',
      controls: DEFAULT_CONTROLS[0],
    },
    {
      id: 'p2',
      name: 'Player 2',
      isBot: false,
      color: CART_COLORS[1].primary,
      secondaryColor: CART_COLORS[1].secondary,
      chassis: 'classic',
      topper: 'shades',
      controls: DEFAULT_CONTROLS[1],
    },
    {
      id: 'p3',
      name: 'Player 3',
      isBot: false,
      color: CART_COLORS[2].primary,
      secondaryColor: CART_COLORS[2].secondary,
      chassis: 'buggy',
      topper: 'helmet',
      controls: DEFAULT_CONTROLS[2],
    },
    {
      id: 'p4',
      name: 'Player 4',
      isBot: false,
      color: CART_COLORS[3].primary,
      secondaryColor: CART_COLORS[3].secondary,
      chassis: 'heavy',
      topper: 'horns',
      controls: DEFAULT_CONTROLS[3],
    },
  ]);

  const updatePlayer = (index: number, updates: Partial<PlayerConfig>) => {
    setPlayers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleStart = () => {
    const activeTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];
    
    // Build array with human players + computer bots
    const gamePlayers: PlayerConfig[] = [];
    
    // Add human players
    for (let i = 0; i < humanCount; i++) {
      gamePlayers.push({
        ...players[i],
        isBot: false,
        controls: DEFAULT_CONTROLS[i],
      });
    }

    // Add computer bots for the rest of total carts
    const botNames = ['Bot Turbo', 'Bot Spark', 'Bot Dynamo', 'Bot Comet', 'Bot Blaze', 'Bot Viper', 'Bot Titan'];
    const botChassis: CartChassis[] = ['speedster', 'heavy', 'buggy', 'classic'];
    const botToppers: TopperType[] = ['none', 'horns', 'helmet', 'stars', 'party'];

    const botsNeeded = Math.max(0, totalCarts - humanCount);
    for (let b = 0; b < botsNeeded; b++) {
      const colorIdx = (humanCount + b + 4) % CART_COLORS.length;
      gamePlayers.push({
        id: `bot_${b + 1}`,
        name: botNames[b % botNames.length],
        isBot: true,
        color: CART_COLORS[colorIdx].primary,
        secondaryColor: CART_COLORS[colorIdx].secondary,
        chassis: botChassis[b % botChassis.length],
        topper: botToppers[b % botToppers.length],
      });
    }

    onStartGame(gamePlayers, activeTrack, gameMode, smashGoal, timeLimit, fairFiftyPercent);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-indigo-950/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl text-white flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
      {/* Header with rotated pink badge & gradient title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-4">
          <div className="bg-pink-500 p-2.5 sm:p-3 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.5)] transform rotate-3 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center font-black text-2xl text-white">S</div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-400 font-['Fredoka']">
                Smash Carts
              </h1>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Vibrant Arena
              </span>
            </div>
            <p className="text-xs text-indigo-300 mt-0.5">
              Pick drivers, customize your carts, select a track, and battle for the crown!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenControls}
            className="px-3.5 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 border border-white/10 text-xs font-bold text-indigo-200 hover:text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Controls
          </button>
          <button
            onClick={onOpenHistory}
            className="px-3.5 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 border border-white/10 text-xs font-bold text-indigo-200 hover:text-white flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Stats & History
          </button>
        </div>
      </div>

      {/* 1. Player Count Selection: 1P, 2P, 3P, 4P */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
          <Users className="w-4 h-4 text-pink-400" />
          1. Number of Human Drivers
        </label>
        <div className="flex bg-indigo-800/70 border border-white/10 rounded-2xl p-1.5 gap-1.5 overflow-x-auto">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => {
                setHumanCount(num);
                if (totalCarts < num) setTotalCarts(num);
              }}
              className={`flex-1 min-w-[90px] py-2.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                humanCount === num
                  ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                  : 'text-indigo-200 hover:bg-indigo-700/60 font-bold'
              }`}
            >
              <span>{num}P</span>
              <span className="text-xs font-semibold opacity-90 hidden sm:inline">
                {num === 1 ? '(Solo)' : 'Drivers'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Total Carts in Arena & 50% Win Rate Computer Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-900/40 border border-white/10 p-4 sm:p-5 rounded-3xl shadow-inner">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2 mb-2.5">
            <Bot className="w-4 h-4 text-amber-400" />
            Total Carts in Arena (Humans + Bots)
          </label>
          <div className="flex items-center gap-2">
            {[2, 3, 4, 6].map(count => (
              <button
                key={count}
                disabled={count < humanCount}
                onClick={() => setTotalCarts(count)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  totalCarts === count
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : count < humanCount
                    ? 'opacity-30 border-white/5 text-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-950/60 border-white/10 text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                {count} Carts {count - humanCount > 0 ? `(${count - humanCount} CPU)` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* 50% Win Rate Computer Fair Play Indicator */}
        <div className="flex flex-col justify-center bg-indigo-950/40 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <label htmlFor="fair_fifty_percent" className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              COMPUTER DIFFICULTY: <span className="text-white font-black">50% WIN RATE</span>
            </label>
            <input
              type="checkbox"
              id="fair_fifty_percent"
              checked={fairFiftyPercent}
              onChange={e => setFairFiftyPercent(e.target.checked)}
              className="w-4 h-4 accent-pink-500 cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-indigo-300 mt-1">
            {fairFiftyPercent 
              ? '⚖️ Active: Dynamic AI Parity balances bot aim & aggression so computer matches target an exact 50% win probability for all ages!' 
              : 'Standard static bot difficulty.'}
          </p>
        </div>
      </div>

      {/* 3. Player Customization Cards */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
          <Car className="w-4 h-4 text-emerald-400" />
          2. Customize Driver Carts (Vibrant Colors & Toppers)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {players.slice(0, humanCount).map((p, idx) => (
            <div
              key={p.id}
              className="bg-indigo-900/40 border border-white/10 rounded-3xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-inner"
            >
              {/* Top paint accent glow banner */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 shadow-[0_0_10px_currentColor]"
                style={{ backgroundColor: p.color, color: p.color }}
              />

              {/* Name input */}
              <div className="flex items-center justify-between gap-2 mt-1">
                <input
                  type="text"
                  value={p.name}
                  maxLength={14}
                  onChange={e => updatePlayer(idx, { name: e.target.value })}
                  className="bg-indigo-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white w-full focus:outline-none focus:border-pink-500 transition-colors"
                />
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300">
                  P{idx + 1}
                </span>
              </div>

              {/* Color Palette Picker */}
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300 block mb-1.5">
                  Paint Color:
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {CART_COLORS.map(c => (
                    <button
                      key={c.name}
                      onClick={() => updatePlayer(idx, { color: c.primary, secondaryColor: c.secondary })}
                      style={{ backgroundColor: c.primary }}
                      className={`w-5 h-5 rounded-full border transition-all active:scale-90 cursor-pointer ${
                        p.color === c.primary ? 'ring-2 ring-white border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'border-white/20 hover:scale-105'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Chassis Type */}
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300 block mb-1">
                  Chassis:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-bold">
                  {(['speedster', 'heavy', 'buggy', 'classic'] as CartChassis[]).map(ch => (
                    <button
                      key={ch}
                      onClick={() => updatePlayer(idx, { chassis: ch })}
                      className={`py-1 px-1.5 rounded-xl border capitalize transition-all cursor-pointer ${
                        p.chassis === ch
                          ? 'bg-indigo-800 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                          : 'bg-indigo-950/60 border-white/10 text-indigo-300 hover:border-white/20'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topper Hat */}
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300 block mb-1">
                  Topper Hat:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                  {([
                    { id: 'none', label: 'None' },
                    { id: 'crown', label: '👑 Crown' },
                    { id: 'helmet', label: '🪖 Helmet' },
                    { id: 'horns', label: '😈 Horns' },
                    { id: 'party', label: '🎉 Party' },
                    { id: 'shades', label: '🕶️ Shades' },
                  ] as { id: TopperType; label: string }[]).map(top => (
                    <button
                      key={top.id}
                      onClick={() => updatePlayer(idx, { topper: top.id })}
                      className={`py-1 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        p.topper === top.id
                          ? 'bg-indigo-800 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                          : 'bg-indigo-950/60 border-white/10 text-indigo-300 hover:border-white/20'
                      }`}
                    >
                      {top.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Track Selection & Power-Up Cache Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Track Selection */}
        <div className="lg:col-span-8 flex flex-col gap-2.5">
          <label className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-pink-400" />
            3. Track Selection
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRACKS.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={`relative group cursor-pointer border-2 rounded-2xl overflow-hidden transition-all active:scale-95 ${
                  selectedTrackId === t.id
                    ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                    : 'border-transparent hover:border-white/20'
                }`}
              >
                <div 
                  className="h-20 flex items-center justify-center text-3xl opacity-90"
                  style={{ backgroundColor: t.backgroundColor }}
                >
                  {t.id === 'white_pearl' ? '🏛️' : t.id === 'snow_white' ? '❄️' : t.id === 'neon_grid' ? '🏎️' : t.id === 'sunset_canyon' ? '🌋' : t.id === 'emerald_castle' ? '🌲' : t.id === 'rainbow_road' ? '🌈' : '🏔️'}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/60 to-transparent flex flex-col justify-end p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate mr-1">{t.name}</span>
                    <span className="text-[9px] uppercase font-bold text-amber-400 shrink-0">{t.theme}</span>
                  </div>
                  {t.width >= 1600 && (
                    <span className="text-[8px] font-black uppercase text-emerald-300 tracking-wider">
                      ★ EXPANSIVE BIG TRACK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Power-Up Cache preview from Vibrant Palette theme */}
        <div className="lg:col-span-4 bg-indigo-900/40 border border-white/10 rounded-3xl p-4 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300">
              Power-Up Arsenal
            </h3>
            <span className="text-[10px] font-bold text-pink-400 bg-pink-500/20 px-2 py-0.5 rounded-full">
              10 Powers
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            <div className="aspect-square bg-amber-400 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(251,191,36,0.3)]" title="Nitro Boost">⚡</div>
            <div className="aspect-square bg-emerald-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(16,185,129,0.3)]" title="Energy Shield">🛡️</div>
            <div className="aspect-square bg-red-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(239,68,68,0.3)]" title="Blast Bomb">💣</div>
            <div className="aspect-square bg-blue-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(59,130,246,0.3)]" title="Homing Rocket">🚀</div>
            <div className="aspect-square bg-cyan-400 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(34,211,238,0.3)]" title="Freeze Beam">❄️</div>
            <div className="aspect-square bg-pink-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(236,72,153,0.3)]" title="Road Spikes">🌀</div>
            <div className="aspect-square bg-yellow-400 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(250,204,21,0.3)]" title="Thunderbolt">🌩️</div>
            <div className="aspect-square bg-orange-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(249,115,22,0.3)]" title="Warhammer">🔨</div>
            <div className="aspect-square bg-purple-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(168,85,247,0.3)]" title="Tornado Vortex">🌪️</div>
            <div className="aspect-square bg-teal-400 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(45,212,191,0.3)]" title="Plasma Laser">🔫</div>
          </div>
          <p className="text-[10px] text-indigo-300 font-bold uppercase mt-2 text-center tracking-wider">
            Collect mystery crates & unleash havoc!
          </p>
        </div>
      </div>

      {/* 5. Game Mode & Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-900/40 p-4 sm:p-5 rounded-3xl border border-white/10 shadow-inner">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-indigo-300 block mb-2">
            Game Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setGameMode('smash_race')}
              className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                gameMode === 'smash_race'
                  ? 'bg-gradient-to-r from-pink-500 to-amber-500 border-pink-400 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  : 'bg-indigo-950/60 border-white/10 text-indigo-300 hover:bg-indigo-800'
              }`}
            >
              🏆 Smash Point Race
            </button>
            <button
              onClick={() => setGameMode('timed_battle')}
              className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                gameMode === 'timed_battle'
                  ? 'bg-gradient-to-r from-pink-500 to-amber-500 border-pink-400 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                  : 'bg-indigo-950/60 border-white/10 text-indigo-300 hover:bg-indigo-800'
              }`}
            >
              ⏱️ Timed Arena
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-indigo-300 block mb-2">
            {gameMode === 'smash_race' ? 'Smash Target (Points)' : 'Time Limit'}
          </label>
          {gameMode === 'smash_race' ? (
            <div className="flex gap-2">
              {[3, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => setSmashGoal(s)}
                  className={`flex-1 py-2.5 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                    smashGoal === s
                      ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                      : 'bg-indigo-950/60 border-white/10 text-indigo-300 hover:bg-indigo-800'
                  }`}
                >
                  {s} Smashes
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {[60, 90, 120].map(sec => (
                <button
                  key={sec}
                  onClick={() => setTimeLimit(sec)}
                  className={`flex-1 py-2.5 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                    timeLimit === sec
                      ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                      : 'bg-indigo-950/60 border-white/10 text-indigo-300 hover:bg-indigo-800'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start Button with Vibrant Theme Gradient */}
      <button
        onClick={handleStart}
        className="w-full py-4 sm:py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 rounded-3xl font-black text-xl sm:text-2xl uppercase tracking-widest shadow-[0_15px_30px_rgba(244,63,94,0.4)] hover:translate-y-0.5 transition-all active:scale-95 text-white flex items-center justify-center gap-3 cursor-pointer"
      >
        <Play className="w-6 h-6 fill-white" />
        SMASH NOW!
      </button>
    </div>
  );
};
