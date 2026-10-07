import React from 'react';
import { Difficulty, GameMode, Question, SubMode } from '../types/math';
import { getBenchmarkTier, getNextBenchmarkTier } from '../utils/benchmarks';

interface GameHUDProps {
  mode: GameMode;
  subMode?: SubMode;
  difficulty: Difficulty;
  timeLeftMs: number;
  maxTimeMs: number;
  currentQuestion: Question;
  inputAnswer: string;
  solvedCount: number;
  streak: number;
  personalBest: number;
  lastFeedback: 'correct' | 'wrong' | null;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  subMode,
  difficulty: _difficulty,
  timeLeftMs,
  maxTimeMs,
  currentQuestion,
  inputAnswer,
  solvedCount,
  streak,
  personalBest: _personalBest,
  lastFeedback,
}) => {
  const isPerQuestionTimer = mode === 'two_by_two';
  const progressRatio = Math.max(0, Math.min(1, timeLeftMs / maxTimeMs));

  // Current benchmark rank
  const nextTier = getNextBenchmarkTier(solvedCount, mode, subMode, _difficulty);

  // Time format
  const secondsLeft = (timeLeftMs / 1000).toFixed(isPerQuestionTimer ? 1 : 0);
  const formattedTime = isPerQuestionTimer
    ? `${secondsLeft}s`
    : `${Math.floor(timeLeftMs / 60000)}:${Math.floor((timeLeftMs % 60000) / 1000)
        .toString()
        .padStart(2, '0')}`;

  const modeTitle =
    mode === 'tables'
      ? 'TABLES'
      : mode === 'add_sub'
      ? subMode === 'add'
        ? 'ADDITION'
        : 'SUBTRACTION'
      : '2×2 BLITZ';

  return (
    <div className="w-full flex-1 flex flex-col justify-between min-h-0 select-none">
      {/* Top Hairline Progress Bar */}
      <div className="w-full h-1 bg-neutral-900 overflow-hidden shrink-0">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            timeLeftMs < (isPerQuestionTimer ? 3000 : 10000) ? 'bg-white' : 'bg-neutral-400'
          }`}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Sleek Top HUD line */}
      <div className="flex items-center justify-between font-mono text-xs text-neutral-400 px-3 py-1.5 shrink-0">
        <span className="uppercase tracking-wider font-semibold text-neutral-300">
          {modeTitle}
        </span>

        {/* Central Timer */}
        <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
          {formattedTime}
        </span>

        {/* Solved Count */}
        <span className="font-semibold text-neutral-300">
          Solved: <strong className="text-white font-bold">{solvedCount}</strong>
        </span>
      </div>

      {/* THE QUESTION HERO - Massive, Commanding, Ultra-Legible */}
      <div
        className={`flex-1 w-full flex flex-col items-center justify-center px-4 py-2 border-y border-neutral-900 transition-colors duration-150 ${
          lastFeedback === 'correct'
            ? 'bg-neutral-900/60'
            : lastFeedback === 'wrong'
            ? 'bg-neutral-900/90'
            : 'bg-black'
        }`}
      >
        {/* Subtle Streak & Target info */}
        <div className="text-xs font-mono text-neutral-400 mb-3 sm:mb-4 flex items-center gap-3">
          <span>
            Streak: <strong className="text-white">{streak}</strong>
          </span>
          {nextTier && (
            <>
              <span className="text-neutral-600">·</span>
              <span>
                Target: <strong className="text-white uppercase">{nextTier.rank}</strong> ({nextTier.minScore})
              </span>
            </>
          )}
        </div>

        {/* The Big Math Equation Stack - Question on top, Blank centered below */}
        <div className="w-full flex flex-col items-center justify-center font-mono select-none text-center my-auto">
          {/* Question Expression */}
          <div className="text-5xl sm:text-6xl font-bold tracking-tight text-white tabular-nums">
            {currentQuestion.operand1} {currentQuestion.operator} {currentQuestion.operand2}
          </div>

          {/* Centered Answer Blank directly below */}
          <div className="mt-3 sm:mt-4 flex items-center justify-center">
            <div className="min-w-[130px] sm:min-w-[160px] max-w-[260px] border-b-4 border-white text-center pb-1 px-4 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums tracking-wider">
                {inputAnswer || <span className="opacity-25 text-neutral-500 font-light">?</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
