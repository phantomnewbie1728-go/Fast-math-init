import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { BENCHMARKS } from '../utils/benchmarks';
import { Difficulty } from '../types/math';

interface BenchmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDifficulty: Difficulty;
}

export const BenchmarksModal: React.FC<BenchmarksModalProps> = ({
  isOpen,
  onClose,
  defaultDifficulty,
}) => {
  const [activeDiff, setActiveDiff] = useState<Difficulty>(defaultDifficulty);

  if (!isOpen) return null;

  const modes = [
    { key: `tables_${activeDiff}`, label: 'Tables (60s)', desc: 'Multiplication tables 2-20' },
    { key: `add_sub_add_${activeDiff}`, label: 'Addition (60s)', desc: 'Rapid single-digit sums' },
    { key: `add_sub_sub_${activeDiff}`, label: 'Subtraction (60s)', desc: 'Single-digit differences' },
    { key: `two_by_two_${activeDiff}`, label: '2×2 Blitz (10s)', desc: 'Two-digit products under 10s clock' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-none flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-white" />
            <h2 className="text-base sm:text-lg font-bold font-mono uppercase tracking-wider text-white">
              Official Math Benchmarks
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

        {/* Difficulty switcher inside modal */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-neutral-400">
            Select tier standards for:
          </div>
          <div className="flex items-center border border-neutral-800 bg-neutral-900 p-0.5">
            <button
              onClick={() => setActiveDiff('medium')}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeDiff === 'medium' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-500'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setActiveDiff('hard')}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeDiff === 'hard' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-500'
              }`}
            >
              Hard
            </button>
          </div>
        </div>

        {/* Benchmarks grid */}
        <div className="space-y-6">
          {modes.map((m) => {
            const data = BENCHMARKS[m.key];
            if (!data) return null;

            return (
              <div key={m.key} className="border border-neutral-900 bg-neutral-900/30 p-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-tight">
                      {m.label}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{m.desc}</p>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    metric: {data.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs pt-1">
                  {data.tiers.map((tier) => (
                    <div
                      key={tier.rank}
                      className="border border-neutral-800 bg-neutral-950 p-2.5 space-y-1"
                    >
                      <div className="text-neutral-400 uppercase text-[10px] tracking-wider">
                        {tier.rank}
                      </div>
                      <div className="text-sm font-bold text-white tabular-nums">
                        {tier.minScore}+
                      </div>
                      <div className="text-[10px] text-neutral-400 leading-tight">
                        {tier.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-white text-black font-mono text-xs uppercase font-semibold hover:bg-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
