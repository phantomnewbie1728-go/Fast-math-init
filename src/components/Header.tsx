import React from 'react';
import { Volume2, VolumeX, Trophy, Info } from 'lucide-react';
import { Difficulty } from '../types/math';

interface HeaderProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRecords: () => void;
  onOpenBenchmarks: () => void;
  isGameActive: boolean;
  onExitGame?: () => void;
  showDifficultyControls?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  onDifficultyChange,
  soundEnabled,
  onToggleSound,
  onOpenRecords,
  onOpenBenchmarks,
  isGameActive,
  onExitGame,
  showDifficultyControls = false,
}) => {
  return (
    <header className={`w-full border-b border-neutral-900 bg-black/95 sticky top-0 z-30 px-3 sm:px-6 transition-all ${isGameActive ? 'py-1.5 sm:py-2.5' : 'py-3 sm:py-3.5'}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          {isGameActive ? (
            <button
              onClick={onExitGame}
              className="text-xs uppercase font-mono tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 border border-neutral-800 px-2.5 py-1 cursor-pointer"
            >
              ← Exit
            </button>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight font-mono text-white">
                ARITHMO
              </span>
              <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
                / mental math
              </span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation & Quick Benchmarks guide */}
        {!isGameActive && (
          <nav className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <button
              onClick={onOpenBenchmarks}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1"
              title="View competitive benchmark standards"
            >
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Benchmarks</span>
            </button>

            <button
              onClick={onOpenRecords}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1"
              title="View personal records and history"
            >
              <Trophy className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Records</span>
            </button>
          </nav>
        )}

        {/* Zone 3: Global controls */}
        <div className="flex items-center gap-2">
          {/* Difficulty Segmented Control - ONLY on Homescreen */}
          {showDifficultyControls && !isGameActive && (
            <div className="flex items-center border border-neutral-800 bg-neutral-950 p-0.5">
              <button
                onClick={() => onDifficultyChange('medium')}
                className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                  difficulty === 'medium'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-300'
                } cursor-pointer`}
                title="Global Difficulty: Medium"
              >
                Med
              </button>
              <button
                onClick={() => onDifficultyChange('hard')}
                className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                  difficulty === 'hard'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-300'
                } cursor-pointer`}
                title="Global Difficulty: Hard"
              >
                Hard
              </button>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white p-1.5 transition-colors"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
