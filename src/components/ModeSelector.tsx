import React from 'react';
import { Difficulty, GameMode, SubMode } from '../types/math';
import { getRecord } from '../utils/storage';
import { getBenchmarkTier } from '../utils/benchmarks';
import { Play, Clock, Zap } from 'lucide-react';

interface ModeSelectorProps {
  difficulty: Difficulty;
  onSelectMode: (mode: GameMode, subMode?: SubMode) => void;
  selectedSubMode: SubMode;
  onSubModeChange: (subMode: SubMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  difficulty,
  onSelectMode,
  selectedSubMode,
  onSubModeChange,
}) => {
  const tablesRecord = getRecord('tables', undefined, difficulty);
  const tablesTier = tablesRecord ? getBenchmarkTier(tablesRecord.bestScore, 'tables', undefined, difficulty) : null;

  const addRecord = getRecord('add_sub', selectedSubMode, difficulty);
  const addTier = addRecord ? getBenchmarkTier(addRecord.bestScore, 'add_sub', selectedSubMode, difficulty) : null;

  const twoByTwoRecord = getRecord('two_by_two', undefined, difficulty);
  const twoByTwoTier = twoByTwoRecord ? getBenchmarkTier(twoByTwoRecord.bestScore, 'two_by_two', undefined, difficulty) : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Editorial Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-900 pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
            Training Ground · {difficulty.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono mt-0.5">
            Calculation Modes
          </h1>
        </div>
        <div className="text-xs font-mono text-neutral-400">
          Global Difficulty: <span className="text-white uppercase font-semibold">{difficulty}</span>
        </div>
      </div>

      {/* 3 Core Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode 1: TABLES */}
        <div className="border border-neutral-800 bg-neutral-950 p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> 60s
              </span>
              <span>01</span>
            </div>

            <div>
              <h2 className="text-xl font-bold font-mono text-white tracking-tight">
                TABLES
              </h2>
              <p className="text-xs font-mono text-neutral-400 mt-1">
                Up to 20 × 10
              </p>
            </div>

            {/* Benchmark / PB Status */}
            <div className="pt-2 border-t border-neutral-900 font-mono text-xs flex justify-between items-baseline">
              <span className="text-neutral-400">Best:</span>
              <span className="text-white font-semibold">
                {tablesRecord ? `${tablesRecord.bestScore} solved · ${tablesTier?.rank}` : 'None'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectMode('tables')}
            className="mt-5 w-full py-2.5 px-4 bg-white text-black font-mono text-xs uppercase font-semibold tracking-wider hover:bg-neutral-200 active:bg-neutral-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Tables
          </button>
        </div>

        {/* Mode 2: ADD / SUB */}
        <div className="border border-neutral-800 bg-neutral-950 p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> 60s
              </span>
              <span>02</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-mono text-white tracking-tight">
                  ADD / SUB
                </h2>
                {/* Compact submode switch */}
                <div className="flex border border-neutral-800 bg-neutral-900 p-0.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => onSubModeChange('add')}
                    className={`px-2 py-0.5 uppercase transition-colors ${
                      selectedSubMode === 'add'
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => onSubModeChange('sub')}
                    className={`px-2 py-0.5 uppercase transition-colors ${
                      selectedSubMode === 'sub'
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    − Sub
                  </button>
                </div>
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-1">
                Single Digit Operations
              </p>
            </div>

            {/* Benchmark / PB Status */}
            <div className="pt-2 border-t border-neutral-900 font-mono text-xs flex justify-between items-baseline">
              <span className="text-neutral-400">Best ({selectedSubMode.toUpperCase()}):</span>
              <span className="text-white font-semibold">
                {addRecord ? `${addRecord.bestScore} solved · ${addTier?.rank}` : 'None'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectMode('add_sub', selectedSubMode)}
            className="mt-5 w-full py-2.5 px-4 bg-white text-black font-mono text-xs uppercase font-semibold tracking-wider hover:bg-neutral-200 active:bg-neutral-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start {selectedSubMode === 'add' ? 'Addition' : 'Subtraction'}
          </button>
        </div>

        {/* Mode 3: 2x2 BLITZ */}
        <div className="border border-neutral-800 bg-neutral-950 p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> 10s / Problem
              </span>
              <span>03</span>
            </div>

            <div>
              <h2 className="text-xl font-bold font-mono text-white tracking-tight">
                2×2 BLITZ
              </h2>
              <p className="text-xs font-mono text-neutral-400 mt-1">
                2-Digit × 2-Digit Multiplication
              </p>
            </div>

            {/* Benchmark / PB Status */}
            <div className="pt-2 border-t border-neutral-900 font-mono text-xs flex justify-between items-baseline">
              <span className="text-neutral-400">Best:</span>
              <span className="text-white font-semibold">
                {twoByTwoRecord ? `${twoByTwoRecord.bestScore} solved · ${twoByTwoTier?.rank}` : 'None'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectMode('two_by_two')}
            className="mt-5 w-full py-2.5 px-4 bg-white text-black font-mono text-xs uppercase font-semibold tracking-wider hover:bg-neutral-200 active:bg-neutral-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start 2×2 Blitz
          </button>
        </div>
      </div>

      {/* Hardware / Keyboard Usage Guide */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 gap-2 pt-2">
        <div>Lightweight client-side engine · Zero latency</div>
        <div>
          Keypad: <kbd className="text-neutral-300 font-semibold">0-9</kbd> · <kbd className="text-neutral-300 font-semibold">Enter</kbd> submit · <kbd className="text-neutral-300 font-semibold">⌫</kbd> delete
        </div>
      </div>
    </div>
  );
};
