import React, { useState } from 'react';
import { MatchRecord, OverallStats } from '../types';
import { Trophy, Trash2, X, AlertTriangle, ShieldCheck, Flame, Calendar, Clock } from 'lucide-react';

interface MatchHistoryModalProps {
  history: MatchRecord[];
  overallStats: OverallStats;
  onResetStats: () => void;
  onClose: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  history,
  overallStats,
  onResetStats,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const botWinRate = overallStats.totalMatches > 0 
    ? Math.round((overallStats.botWins / overallStats.totalMatches) * 100) 
    : 50;

  const humanWinRate = overallStats.totalMatches > 0 
    ? Math.round((overallStats.humanWins / overallStats.totalMatches) * 100) 
    : 50;

  return (
    <div className="w-full max-w-4xl mx-auto bg-indigo-950/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl text-white flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] flex items-center justify-center text-white font-black transform rotate-2">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-400 font-['Fredoka']">
              Match History & Lifetime Stats
            </h2>
            <p className="text-xs text-indigo-300">
              Complete log of past smash battles and 50% computer parity tracking
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 border border-white/10 text-indigo-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 50% Win Rate Parity Tracker Banner */}
      <div className="bg-indigo-900/40 border border-white/10 rounded-3xl p-4 sm:p-5 flex flex-col gap-2.5 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-200">
              Computer 50% Win Rate Parity Monitor
            </span>
          </div>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300">
            Target: 50% Balance
          </span>
        </div>

        {/* Win Rate Split Bar */}
        <div className="w-full bg-indigo-950 h-4 rounded-full overflow-hidden flex border border-white/10">
          <div
            className="bg-cyan-400 h-full transition-all duration-300 flex items-center justify-center text-[9px] font-black text-slate-950"
            style={{ width: `${humanWinRate}%` }}
          >
            {humanWinRate > 15 ? `Human ${humanWinRate}%` : ''}
          </div>
          <div
            className="bg-pink-500 h-full transition-all duration-300 flex items-center justify-center text-[9px] font-black text-white"
            style={{ width: `${botWinRate}%` }}
          >
            {botWinRate > 15 ? `CPU ${botWinRate}%` : ''}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-indigo-300">
          <span>Human Wins: <strong className="text-cyan-300">{overallStats.humanWins}</strong></span>
          <span>Computer Wins: <strong className="text-pink-400">{overallStats.botWins}</strong></span>
          <span>Total Matches: <strong className="text-white">{overallStats.totalMatches}</strong></span>
        </div>
      </div>

      {/* Summary Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-indigo-900/40 border border-white/10 p-4 rounded-2xl shadow-inner">
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Total Matches</span>
          <div className="text-2xl font-black text-white font-['Fredoka'] mt-1">
            {overallStats.totalMatches}
          </div>
        </div>

        <div className="bg-indigo-900/40 border border-white/10 p-4 rounded-2xl shadow-inner">
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Total Smashes</span>
          <div className="text-2xl font-black text-amber-400 font-['Fredoka'] mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 text-amber-400" />
            {overallStats.totalSmashes}
          </div>
        </div>

        <div className="bg-indigo-900/40 border border-white/10 p-4 rounded-2xl shadow-inner">
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Human Wins</span>
          <div className="text-2xl font-black text-cyan-400 font-['Fredoka'] mt-1">
            {overallStats.humanWins}
          </div>
        </div>

        <div className="bg-indigo-900/40 border border-white/10 p-4 rounded-2xl shadow-inner">
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300">Computer Wins</span>
          <div className="text-2xl font-black text-pink-400 font-['Fredoka'] mt-1">
            {overallStats.botWins}
          </div>
        </div>
      </div>

      {/* Past Matches List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
            Past Match Logs ({history.length})
          </span>

          {/* Reset Stats Button */}
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-800 hover:bg-rose-500/20 hover:text-rose-300 text-indigo-300 border border-white/10 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Match Stats
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-500/60 px-3 py-1.5 rounded-xl animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-300">Wipe all stats?</span>
              <button
                onClick={() => {
                  onResetStats();
                  setShowConfirmReset(false);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase active:scale-95 cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2 py-0.5 rounded-lg bg-indigo-800 text-indigo-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-indigo-900/30 border border-dashed border-white/10 rounded-3xl p-8 text-center text-indigo-300 text-sm shadow-inner">
            No matches recorded yet. Start a smash match and battle to create your history!
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {history.map((record) => (
              <div
                key={record.id}
                className="bg-indigo-900/30 border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-pink-500/50 transition-colors shadow-inner"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border border-white/20 shadow"
                    style={{ backgroundColor: record.winnerColor }}
                  >
                    🏆
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Winner:</span>
                      <span style={{ color: record.winnerColor }}>{record.winnerName}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-300 border border-white/10">
                        {record.isWinnerBot ? '🤖 CPU' : '👤 Human'}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-300 flex items-center gap-3 mt-0.5">
                      <span>📍 {record.trackName}</span>
                      <span>🎮 {record.gameMode === 'smash_race' ? 'Smash Race' : 'Timed Battle'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="flex items-center gap-1 text-indigo-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{record.durationSeconds}s</span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{record.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Close Button */}
      <div className="pt-2 border-t border-white/10 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
};
