import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Track, 
  PlayerConfig, 
  GameMode, 
  KartState, 
  Projectile, 
  HazardTrap, 
  PowerCrate, 
  Particle, 
  SkidMark, 
  KillFeedEvent, 
  MatchRecord, 
  MatchScoreboardItem 
} from '../types';
import { 
  createInitialKart, 
  updateKartMovement, 
  handleKartToKartCollisions, 
  activateKartPower, 
  updateProjectiles, 
  updateTraps, 
  updatePowerCrates 
} from '../game/physics';
import { updateBotAI } from '../game/ai';
import { renderGame } from '../game/renderer';
import { ScoreboardHUD } from './ScoreboardHUD';
import { TouchControls } from './TouchControls';
import { sounds } from '../audio/soundEffects';

interface ArenaCanvasProps {
  track: Track;
  players: PlayerConfig[];
  gameMode: GameMode;
  smashGoal: number;
  timeLimit: number;
  fairFiftyPercent: boolean;
  onMatchEnd: (record: MatchRecord) => void;
  onOpenControls: () => void;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  track,
  players,
  gameMode,
  smashGoal,
  timeLimit,
  fairFiftyPercent,
  onMatchEnd,
  onOpenControls,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Match states
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [killFeed, setKillFeed] = useState<KillFeedEvent[]>([]);
  const [matchOver, setMatchOver] = useState(false);

  // Refs for high-speed game state without re-render stutter
  const kartsRef = useRef<KartState[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const trapsRef = useRef<HazardTrap[]>([]);
  const cratesRef = useRef<PowerCrate[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const skidMarksRef = useRef<SkidMark[]>([]);
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const touchInputsRef = useRef<Record<string, boolean>>({});
  const elapsedTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const animFrameIdRef = useRef<number>(0);
  const matchEndedRef = useRef<boolean>(false);

  // Initialize Game entities
  useEffect(() => {
    matchEndedRef.current = false;
    setMatchOver(false);
    setTimeRemaining(timeLimit);
    startTimeRef.current = Date.now();

    // Spawn karts at track spawn points
    kartsRef.current = players.map((p, idx) => {
      const spawn = track.playerSpawns[idx % track.playerSpawns.length];
      return createInitialKart(p, spawn);
    });

    // Spawn power crates at track locations
    cratesRef.current = track.crateSpawns.map((cs, idx) => ({
      id: `crate_${idx}`,
      x: cs.x,
      y: cs.y,
      active: true,
      respawnTimer: 0,
      rotation: Math.random() * Math.PI * 2,
    }));

    projectilesRef.current = [];
    trapsRef.current = [];
    particlesRef.current = [];
    skidMarksRef.current = [];
    setKillFeed([]);

    sounds.playCountdown(true);
  }, [track, players, gameMode, smashGoal, timeLimit]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrows/space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressedRef.current[e.code] = true;

      // Handle instant power-up trigger for human players
      for (const kart of kartsRef.current) {
        if (!kart.config.isBot && kart.config.controls) {
          if (e.code === kart.config.controls.action) {
            activateKartPower(
              kart,
              kartsRef.current,
              projectilesRef.current,
              trapsRef.current,
              particlesRef.current
            );
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle Touch Inputs (for P1)
  const handleTouchInput = (action: 'forward' | 'backward' | 'left' | 'right' | 'action' | 'drift', active: boolean) => {
    touchInputsRef.current[action] = active;
    if (action === 'action' && active) {
      const p1 = kartsRef.current.find(k => !k.config.isBot);
      if (p1) {
        activateKartPower(
          p1,
          kartsRef.current,
          projectilesRef.current,
          trapsRef.current,
          particlesRef.current
        );
      }
    }
  };

  const endMatch = useCallback(() => {
    if (matchEndedRef.current) return;
    matchEndedRef.current = true;
    setMatchOver(true);

    // Build final scoreboard
    const sorted = [...kartsRef.current].sort((a, b) => {
      if (b.smashes !== a.smashes) return b.smashes - a.smashes;
      return b.score - a.score;
    });

    const scoreboard: MatchScoreboardItem[] = sorted.map((k, idx) => ({
      playerId: k.id,
      name: k.config.name,
      isBot: k.config.isBot,
      color: k.color,
      smashes: k.smashes,
      damageDealt: k.damageDealt,
      score: k.score,
      rank: idx + 1,
    }));

    const winner = sorted[0];
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const record: MatchRecord = {
      id: Math.random().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      trackName: track.name,
      gameMode,
      humanPlayersCount: players.filter(p => !p.isBot).length,
      botCount: players.filter(p => p.isBot).length,
      winnerName: winner.config.name,
      winnerColor: winner.color,
      isWinnerBot: winner.config.isBot,
      durationSeconds,
      scoreboard,
    };

    onMatchEnd(record);
  }, [gameMode, onMatchEnd, players, track.name]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused && !matchEndedRef.current) {
        elapsedTimeRef.current += 1 / 60;

        // Check match timer for timed mode
        if (gameMode === 'timed_battle') {
          setTimeRemaining(prev => {
            const next = prev - 1 / 60;
            if (next <= 0) {
              endMatch();
              return 0;
            }
            return next;
          });
        }

        // 1. Update Human and Bot inputs
        for (const kart of kartsRef.current) {
          if (kart.config.isBot) {
            // Bot AI
            const decision = updateBotAI(
              kart,
              kartsRef.current,
              track,
              cratesRef.current,
              projectilesRef.current,
              trapsRef.current,
              particlesRef.current,
              fairFiftyPercent
            );
            updateKartMovement(
              kart,
              decision,
              track,
              particlesRef.current,
              skidMarksRef.current
            );
          } else {
            // Human player
            const c = kart.config.controls;
            const isP1 = kart.config.id === 'p1';
            const forward = (c && !!keysPressedRef.current[c.up]) || (isP1 && !!touchInputsRef.current['forward']);
            const backward = (c && !!keysPressedRef.current[c.down]) || (isP1 && !!touchInputsRef.current['backward']);
            const left = (c && !!keysPressedRef.current[c.left]) || (isP1 && !!touchInputsRef.current['left']);
            const right = (c && !!keysPressedRef.current[c.right]) || (isP1 && !!touchInputsRef.current['right']);
            const drift = (c && !!keysPressedRef.current[c.drift]) || (isP1 && !!touchInputsRef.current['drift']);

            updateKartMovement(
              kart,
              { forward, backward, left, right, drift },
              track,
              particlesRef.current,
              skidMarksRef.current
            );
          }

          // Check for Smash Race win condition
          if (gameMode === 'smash_race' && kart.smashes >= smashGoal) {
            endMatch();
          }
        }

        // 2. Physics & Collisions
        handleKartToKartCollisions(kartsRef.current, particlesRef.current, killFeed);
        updateProjectiles(projectilesRef.current, kartsRef.current, track, particlesRef.current, killFeed);
        updateTraps(trapsRef.current, kartsRef.current);
        updatePowerCrates(cratesRef.current, kartsRef.current);
      }

      // 3. Render onto Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderGame(
            ctx,
            track,
            kartsRef.current,
            projectilesRef.current,
            trapsRef.current,
            cratesRef.current,
            particlesRef.current,
            skidMarksRef.current,
            elapsedTimeRef.current
          );
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPaused, track, gameMode, smashGoal, fairFiftyPercent, endMatch, killFeed]);

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Find active human player for touch controls
  const activeHuman = kartsRef.current.find(k => !k.config.isBot) || kartsRef.current[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-indigo-950 select-none">
      {/* Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={track.width}
        height={track.height}
        className="w-full h-full max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
      />

      {/* In-Game Live HUD */}
      <ScoreboardHUD
        karts={kartsRef.current}
        matchTimeRemaining={timeRemaining}
        gameMode={gameMode}
        smashGoal={smashGoal}
        killFeed={killFeed}
        isPaused={isPaused}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onTogglePause={togglePause}
        onOpenControls={onOpenControls}
      />

      {/* Touch Screen Controls overlay */}
      <TouchControls
        hasPower={!!activeHuman?.currentPower}
        powerType={activeHuman?.currentPower || null}
        onInput={handleTouchInput}
      />

      {/* Paused Overlay */}
      {isPaused && !matchOver && (
        <div className="absolute inset-0 bg-indigo-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-30 animate-in fade-in">
          <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-400 font-['Fredoka']">
            MATCH PAUSED
          </div>
          <p className="text-xs text-indigo-200">Take a breath, adjust your grip, and jump right back into the arena!</p>
          <button
            onClick={togglePause}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-base uppercase tracking-wider shadow-[0_10px_25px_rgba(244,63,94,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            RESUME MATCH
          </button>
        </div>
      )}
    </div>
  );
};
