import React, { useEffect, useState } from 'react';
import { RoundStats } from '../types/math';
import { getBenchmarkTier, getNextBenchmarkTier } from '../utils/benchmarks';
import { RotateCcw, ArrowLeft, Check, X, Clock, Flame, Award } from 'lucide-react';

interface RoundSummaryProps {
  stats: RoundStats;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const RoundSummary: React.FC<RoundSummaryProps> = ({
  stats,
  onPlayAgain,
  onBackToMenu,
}) => {
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPlayAgain();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBackToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain, onBackToMenu]);

  const tier = getBenchmarkTier(stats.correctAnswers, stats.mode, stats.subMode, stats.difficulty);
  const nextTier = getNextBenchmarkTier(stats.correctAnswers, stats.mode, stats.subMode, stats.difficulty);

  const displayedAnswers = filterWrongOnly
    ? stats.answers.filter((a) => !a.isCorrect)
    : stats.answers;

  const modeLabel =
    stats.mode === 'tables'
      ? 'Tables (60s)'
      : stats.mode === 'add_sub'
      ? `${stats.subMode === 'add' ? 'Addition' : 'Subtraction'} (60s)`
      : '2×2 Blitz (10s)';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-6 font-sans">
      {/* Top Banner / PB notification */}
      <div className="border border-neutral-800 bg-neutral-950 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-900 pb-3">
          <div>
            <div className="text-[11px] font-mono uppercase text-neutral-400">
              Round Complete · {modeLabel} · {stats.difficulty.toUpperCase()}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white mt-0.5">
              Performance Summary
            </h1>
          </div>

          {stats.isNewPersonalBest && (
            <div className="px-2.5 py-1 border border-white bg-white text-black font-mono text-xs font-bold uppercase tracking-wider self-start sm:self-auto flex items-center gap-1">
              <Award className="w-3.5 h-3.5 fill-current" />
              New Record
            </div>
          )}
        </div>

        {/* Primary Benchmark Score Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Solved Benchmark */}
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono uppercase text-neutral-400">
              Solved (Score)
            </div>
            <div className="text-5xl sm:text-6xl font-bold font-mono text-white tabular-nums tracking-tight">
              {stats.correctAnswers}
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Accuracy: <span className="text-white font-semibold">{stats.accuracy}%</span> ({stats.correctAnswers}/{stats.totalQuestionsAttempted})
            </div>
          </div>

          {/* Benchmark Rank */}
          <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-1.5 flex flex-col justify-center">
            <div className="text-[11px] font-mono uppercase text-neutral-400">
              Benchmark Tier
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white uppercase tracking-wide">
              {tier.rank}
            </div>
            <p className="text-xs text-neutral-400 leading-snug">
              {tier.description}
            </p>
            {nextTier && (
              <div className="text-[11px] font-mono text-neutral-400 pt-1.5 border-t border-neutral-800">
                Next: <strong className="text-white uppercase">{nextTier.rank}</strong> ({nextTier.minScore} required)
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic Metrics Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <div className="border border-neutral-800 bg-neutral-900/40 p-2.5 space-y-0.5">
            <div className="text-neutral-400 uppercase text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-400" /> Avg Speed
            </div>
            <div className="text-sm font-bold text-white tabular-nums">
              {(stats.averageTimeMs / 1000).toFixed(2)}s
            </div>
          </div>

          <div className="border border-neutral-800 bg-neutral-900/40 p-2.5 space-y-0.5">
            <div className="text-neutral-400 uppercase text-[10px] flex items-center gap-1">
              <Flame className="w-3 h-3 text-neutral-400" /> Streak
            </div>
            <div className="text-sm font-bold text-white tabular-nums">
              {stats.bestStreak}
            </div>
          </div>

          <div className="border border-neutral-800 bg-neutral-900/40 p-2.5 space-y-0.5">
            <div className="text-neutral-400 uppercase text-[10px] flex items-center gap-1">
              <Check className="w-3 h-3 text-neutral-400" /> Correct
            </div>
            <div className="text-sm font-bold text-white tabular-nums">
              {stats.correctAnswers}
            </div>
          </div>

          <div className="border border-neutral-800 bg-neutral-900/40 p-2.5 space-y-0.5">
            <div className="text-neutral-400 uppercase text-[10px] flex items-center gap-1">
              <X className="w-3 h-3 text-neutral-400" /> Errors
            </div>
            <div className="text-sm font-bold text-white tabular-nums">
              {stats.wrongAnswers + stats.timedOutCount}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-neutral-900">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto flex-1 py-2.5 px-5 bg-white text-black font-mono text-xs uppercase font-semibold tracking-wider hover:bg-neutral-200 active:bg-neutral-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Play Again [Enter]
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full sm:w-auto py-2.5 px-5 border border-neutral-800 bg-neutral-900 font-mono text-xs uppercase font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Modes [Esc]
          </button>
        </div>
      </div>

      {/* Answer Log / Review Section */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
            Problem Log Breakdown ({stats.answers.length})
          </h2>

          {stats.wrongAnswers > 0 && (
            <div className="flex items-center gap-1 border border-neutral-800 bg-neutral-900 p-0.5">
              <button
                type="button"
                onClick={() => setFilterWrongOnly(false)}
                className={`px-2.5 py-1 text-xs font-mono uppercase ${
                  !filterWrongOnly ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterWrongOnly(true)}
                className={`px-2.5 py-1 text-xs font-mono uppercase ${
                  filterWrongOnly ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mistakes ({stats.wrongAnswers + stats.timedOutCount})
              </button>
            </div>
          )}
        </div>

        {displayedAnswers.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-neutral-400 border border-neutral-900">
            No errors recorded. Flawless run!
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-900 font-mono text-xs">
            {displayedAnswers.map((log, index) => (
              <div
                key={index}
                className="py-2.5 px-3 flex items-center justify-between hover:bg-neutral-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 w-6">#{index + 1}</span>
                  <span className="text-white font-medium text-sm tabular-nums">
                    {log.question.text}
                  </span>
                  <span className="text-neutral-400">=</span>
                  <span className="text-white font-bold tabular-nums">
                    {log.question.correctAnswer}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-neutral-400 tabular-nums">
                    {(log.timeTakenMs / 1000).toFixed(2)}s
                  </div>
                  {log.isCorrect ? (
                    <span className="text-neutral-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> OK
                    </span>
                  ) : (
                    <span className="text-neutral-400 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      {log.userAnswer === null ? 'Timeout' : `Typed ${log.userAnswer}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
