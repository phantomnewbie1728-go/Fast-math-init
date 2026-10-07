import React, { useState } from 'react';
import { X, Trophy, History, Trash2 } from 'lucide-react';
import { AllRecords, RoundStats } from '../types/math';
import { clearAllData } from '../utils/storage';

interface RecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AllRecords;
  history: RoundStats[];
  onRefreshRecords: () => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  isOpen,
  onClose,
  records,
  history,
  onRefreshRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'history'>('records');

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Reset all personal bests and history records?')) {
      clearAllData();
      onRefreshRecords();
    }
  };

  const recordKeys = [
    { key: 'tables_medium', label: 'Tables · Medium' },
    { key: 'tables_hard', label: 'Tables · Hard' },
    { key: 'add_sub_add_medium', label: 'Addition · Medium' },
    { key: 'add_sub_add_hard', label: 'Addition · Hard' },
    { key: 'add_sub_sub_medium', label: 'Subtraction · Medium' },
    { key: 'add_sub_sub_hard', label: 'Subtraction · Hard' },
    { key: 'two_by_two_medium', label: '2×2 Blitz · Medium' },
    { key: 'two_by_two_hard', label: '2×2 Blitz · Hard' },
  ];

  let totalSolvedAllTime = 0;
  let totalAttemptedAllTime = 0;
  Object.values(records).forEach((rec) => {
    totalSolvedAllTime += rec.totalCorrect;
    totalAttemptedAllTime += rec.totalAttempted;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-none flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-white" />
            <h2 className="text-base sm:text-lg font-bold font-mono uppercase tracking-wider text-white">
              Personal Records & Telemetry
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Lifetime Metrics */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="border border-neutral-900 bg-neutral-900/40 p-3 space-y-1">
            <div className="text-neutral-400 uppercase text-[10px]">Total Solved</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {totalSolvedAllTime}
            </div>
          </div>
          <div className="border border-neutral-900 bg-neutral-900/40 p-3 space-y-1">
            <div className="text-neutral-400 uppercase text-[10px]">Total Attempted</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {totalAttemptedAllTime}
            </div>
          </div>
          <div className="border border-neutral-900 bg-neutral-900/40 p-3 space-y-1">
            <div className="text-neutral-400 uppercase text-[10px]">Accuracy</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {totalAttemptedAllTime > 0
                ? `${Math.round((totalSolvedAllTime / totalAttemptedAllTime) * 100)}%`
                : '—'}
            </div>
          </div>
        </div>

        {/* Tabs: Personal Bests vs Recent History */}
        <div className="flex items-center gap-1 border-b border-neutral-900 pt-2">
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'records'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Personal Bests
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Recent History ({history.length})
          </button>
        </div>

        {/* Tab 1: PB Matrix */}
        {activeTab === 'records' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {recordKeys.map((item) => {
              const rec = records[item.key];
              return (
                <div
                  key={item.key}
                  className="border border-neutral-900 bg-neutral-900/20 p-3.5 flex justify-between items-center"
                >
                  <span className="text-neutral-300">{item.label}</span>
                  <div className="text-right">
                    <span className="text-white font-bold text-sm tabular-nums">
                      {rec ? `${rec.bestScore} solved` : '—'}
                    </span>
                    {rec && rec.bestStreak > 0 && (
                      <div className="text-[10px] text-neutral-400">
                        streak: {rec.bestStreak}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: History List */}
        {activeTab === 'history' && (
          <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
            {history.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 border border-neutral-900">
                No past sessions recorded yet. Play a round!
              </div>
            ) : (
              <div className="divide-y divide-neutral-900 border border-neutral-900">
                {history.map((h) => {
                  const modeText =
                    h.mode === 'tables'
                      ? 'Tables'
                      : h.mode === 'add_sub'
                      ? `${h.subMode === 'add' ? 'Add' : 'Sub'}`
                      : '2×2 Blitz';
                  const dateStr = new Date(h.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={h.id}
                      className="p-2.5 flex items-center justify-between hover:bg-neutral-900/40 transition-colors"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {modeText} · {h.difficulty.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-neutral-400">{dateStr}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-bold tabular-nums">
                          {h.correctAnswers} solved · {h.accuracy}%
                        </div>
                        <div className="text-[10px] text-neutral-400 uppercase">
                          Tier: {h.benchmarkRank}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-neutral-900 flex justify-between items-center">
          <button
            onClick={handleClear}
            className="text-xs font-mono text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset Data
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 bg-white text-black font-mono text-xs uppercase font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
