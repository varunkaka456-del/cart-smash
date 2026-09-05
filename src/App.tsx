/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PlayerConfig, 
  Track, 
  GameMode, 
  MatchRecord, 
  OverallStats, 
  PowerType 
} from './types';
import { TRACKS } from './game/tracks';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { ArenaCanvas } from './components/ArenaCanvas';
import { MatchEndModal } from './components/MatchEndModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';

const STORAGE_KEY_HISTORY = 'smash_carts_match_history_v1';
const STORAGE_KEY_STATS = 'smash_carts_overall_stats_v1';

const INITIAL_STATS: OverallStats = {
  totalMatches: 0,
  humanWins: 0,
  botWins: 0,
  totalSmashes: 0,
  totalDamage: 0,
  powerUpsUsedCount: {
    rocket: 0,
    nitro: 0,
    shield: 0,
    bomb: 0,
    freeze: 0,
    spikes: 0,
    oil: 0,
    lightning: 0,
    hammer: 0,
    tornado: 0,
    laser: 0,
  },
  mostPlayedTrack: 'White Pearl Grand Arena (Big Track)',
};

export default function App() {
  const [gameState, setGameState] = useState<'setup' | 'racing' | 'ended'>('setup');
  const [activeModal, setActiveModal] = useState<'history' | 'controls' | null>(null);

  // Active Game Configuration
  const [currentPlayers, setCurrentPlayers] = useState<PlayerConfig[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>('smash_race');
  const [currentSmashGoal, setCurrentSmashGoal] = useState<number>(5);
  const [currentTimeLimit, setCurrentTimeLimit] = useState<number>(90);
  const [fairFiftyPercent, setFairFiftyPercent] = useState<boolean>(true);

  // Completed match record
  const [latestMatchRecord, setLatestMatchRecord] = useState<MatchRecord | null>(null);

  // History and Lifetime Stats
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>(INITIAL_STATS);

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        setMatchHistory(JSON.parse(savedHistory));
      }
      const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
      if (savedStats) {
        setOverallStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error('Failed to load local match data:', e);
    }
  }, []);

  // Save history to localStorage
  const saveMatchRecord = (record: MatchRecord) => {
    setMatchHistory(prev => {
      const updated = [record, ...prev].slice(0, 50); // Keep last 50 matches
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save match history:', e);
      }
      return updated;
    });

    setOverallStats(prev => {
      const totalMatches = prev.totalMatches + 1;
      const humanWins = prev.humanWins + (record.isWinnerBot ? 0 : 1);
      const botWins = prev.botWins + (record.isWinnerBot ? 1 : 0);
      const totalSmashes = prev.totalSmashes + record.scoreboard.reduce((sum, s) => sum + s.smashes, 0);
      const totalDamage = prev.totalDamage + record.scoreboard.reduce((sum, s) => sum + s.damageDealt, 0);

      const updated: OverallStats = {
        ...prev,
        totalMatches,
        humanWins,
        botWins,
        totalSmashes,
        totalDamage,
        mostPlayedTrack: record.trackName,
      };

      try {
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save overall stats:', e);
      }
      return updated;
    });
  };

  // Reset all match stats & history
  const handleResetStats = () => {
    setMatchHistory([]);
    setOverallStats(INITIAL_STATS);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      localStorage.removeItem(STORAGE_KEY_STATS);
    } catch (e) {
      console.error('Failed to reset match data:', e);
    }
  };

  const handleStartGame = (
    players: PlayerConfig[],
    track: Track,
    mode: GameMode,
    smashGoal: number,
    timeLimit: number,
    fiftyPercent: boolean
  ) => {
    setCurrentPlayers(players);
    setCurrentTrack(track);
    setCurrentGameMode(mode);
    setCurrentSmashGoal(smashGoal);
    setCurrentTimeLimit(timeLimit);
    setFairFiftyPercent(fiftyPercent);
    setGameState('racing');
  };

  const handleMatchEnd = (record: MatchRecord) => {
    setLatestMatchRecord(record);
    saveMatchRecord(record);
    setGameState('ended');
  };

  const handleRematch = () => {
    setGameState('racing');
  };

  const handleMainMenu = () => {
    setGameState('setup');
  };

  return (
    <div className="relative w-screen h-screen bg-[#1e1b4b] text-white flex flex-col justify-between overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Main Game Screen Viewport */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
        {/* 1. Pre-Game Setup Screen */}
        {gameState === 'setup' && (
          <PlayerSetupModal
            onStartGame={handleStartGame}
            onOpenHistory={() => setActiveModal('history')}
            onOpenControls={() => setActiveModal('controls')}
          />
        )}

        {/* 2. Active Racing & Smash Combat Arena */}
        {gameState === 'racing' && (
          <ArenaCanvas
            track={currentTrack}
            players={currentPlayers}
            gameMode={currentGameMode}
            smashGoal={currentSmashGoal}
            timeLimit={currentTimeLimit}
            fairFiftyPercent={fairFiftyPercent}
            onMatchEnd={handleMatchEnd}
            onOpenControls={() => setActiveModal('controls')}
          />
        )}

        {/* 3. Post-Match Game Over Screen */}
        {gameState === 'ended' && latestMatchRecord && (
          <MatchEndModal
            matchRecord={latestMatchRecord}
            onRematch={handleRematch}
            onMainMenu={handleMainMenu}
            onOpenHistory={() => setActiveModal('history')}
          />
        )}
      </div>

      {/* Vibrant Palette Footer Bar */}
      <footer className="h-9 bg-black/30 border-t border-white/5 flex items-center justify-between px-6 text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Build v2.4.0-smash</span>
        </div>
        <div className="hidden sm:block text-indigo-300">
          Smash Carts Arena &bull; Vibrant Edition
        </div>
        <div className="flex items-center gap-4">
          <span className="text-amber-400">50% AI Balance</span>
          <span className="text-pink-400">1-4P Local</span>
        </div>
      </footer>

      {/* History & Lifetime Stats Modal */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center p-3 z-50 animate-in fade-in">
          <MatchHistoryModal
            history={matchHistory}
            overallStats={overallStats}
            onResetStats={handleResetStats}
            onClose={() => setActiveModal(null)}
          />
        </div>
      )}

      {/* Controls Guide Modal */}
      {activeModal === 'controls' && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center p-3 z-50 animate-in fade-in">
          <ControlsGuideModal onClose={() => setActiveModal(null)} />
        </div>
      )}
    </div>
  );
}
