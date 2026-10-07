import { BenchmarkTier, Difficulty, GameMode, SubMode } from '../types/math';

export interface ModeBenchmarks {
  tiers: BenchmarkTier[];
  unit: string;
}

export const BENCHMARKS: Record<string, ModeBenchmarks> = {
  // Tables mode
  'tables_medium': {
    unit: 'questions / 60s',
    tiers: [
      { rank: 'Legend', minScore: 45, description: 'Elite speed arithmetic master' },
      { rank: 'Grandmaster', minScore: 35, description: 'Rapid sub-2 second recall' },
      { rank: 'Pro', minScore: 25, description: 'Solid automatic table retrieval' },
      { rank: 'Competitor', minScore: 16, description: 'Consistent mental calculation' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },
  'tables_hard': {
    unit: 'questions / 60s',
    tiers: [
      { rank: 'Legend', minScore: 38, description: 'Unreal mastery of 11-20 tables' },
      { rank: 'Grandmaster', minScore: 28, description: 'Advanced teen-table fluency' },
      { rank: 'Pro', minScore: 20, description: 'Strong teen tables calculation' },
      { rank: 'Competitor', minScore: 12, description: 'Emerging upper table recall' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },

  // Add / Sub mode
  'add_sub_add_medium': {
    unit: 'questions / 60s',
    tiers: [
      { rank: 'Legend', minScore: 60, description: 'Flawless single-digit reflex' },
      { rank: 'Grandmaster', minScore: 48, description: 'High-speed addition cadence' },
      { rank: 'Pro', minScore: 36, description: 'Rapid basic fact retrieval' },
      { rank: 'Competitor', minScore: 24, description: 'Reliable single-digit sums' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },
  'add_sub_add_hard': {
    unit: 'questions / 60s',
    tiers: [
      { rank: 'Legend', minScore: 50, description: 'Instantaneous carry resolution' },
      { rank: 'Grandmaster', minScore: 38, description: 'Lightning bridge-ten additions' },
      { rank: 'Pro', minScore: 28, description: 'Fluid cross-ten calculation' },
      { rank: 'Competitor', minScore: 18, description: 'Steady carry arithmetic' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },
  'add_sub_sub_medium': {
    unit: 'questions / 60s',
    tiers: [
      { rank: 'Legend', minScore: 58, description: 'Instant single-digit differences' },
      { rank: 'Grandmaster', minScore: 45, description: 'Rapid subtraction rhythm' },
      { rank: 'Pro', minScore: 34, description: 'Confident subtraction recall' },
      { rank: 'Competitor', minScore: 22, description: 'Steady single-digit differences' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },
  'add_sub_sub_hard': {
    unit: 'questions / 60s',
    tiers: [
      { rank: 'Legend', minScore: 48, description: 'Flawless teen-minus-single facts' },
      { rank: 'Grandmaster', minScore: 36, description: 'Swift bridge-ten subtractions' },
      { rank: 'Pro', minScore: 26, description: 'Strong subtraction fluency' },
      { rank: 'Competitor', minScore: 16, description: 'Competent reverse addition' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },

  // 2x2 Blitz mode
  'two_by_two_medium': {
    unit: 'questions solved (10s blitz)',
    tiers: [
      { rank: 'Legend', minScore: 25, description: 'Grandmaster speed multiplier' },
      { rank: 'Grandmaster', minScore: 18, description: 'Rapid 2x2 mental cross-multiplication' },
      { rank: 'Pro', minScore: 12, description: 'Sharp algorithmic mental arithmetic' },
      { rank: 'Competitor', minScore: 6, description: 'Consistent mental calculation' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },
  'two_by_two_hard': {
    unit: 'questions solved (10s blitz)',
    tiers: [
      { rank: 'Legend', minScore: 20, description: 'Mental math prodigy' },
      { rank: 'Grandmaster', minScore: 14, description: 'Blazing 2x2 arbitrary products' },
      { rank: 'Pro', minScore: 8, description: 'Elite mental cross-product agility' },
      { rank: 'Competitor', minScore: 4, description: 'Fast mental breakdown under 10s' },
      { rank: 'Novice', minScore: 0, description: 'Foundation builder' },
    ],
  },
};

export function getBenchmarkKey(mode: GameMode, subMode: SubMode | undefined, difficulty: Difficulty): string {
  if (mode === 'add_sub') {
    return `add_sub_${subMode || 'add'}_${difficulty}`;
  }
  return `${mode}_${difficulty}`;
}

export function getBenchmarkTier(score: number, mode: GameMode, subMode: SubMode | undefined, difficulty: Difficulty): BenchmarkTier {
  const key = getBenchmarkKey(mode, subMode, difficulty);
  const benchmark = BENCHMARKS[key] || BENCHMARKS['tables_medium'];
  
  for (const tier of benchmark.tiers) {
    if (score >= tier.minScore) {
      return tier;
    }
  }
  return benchmark.tiers[benchmark.tiers.length - 1];
}

export function getNextBenchmarkTier(score: number, mode: GameMode, subMode: SubMode | undefined, difficulty: Difficulty): BenchmarkTier | null {
  const key = getBenchmarkKey(mode, subMode, difficulty);
  const benchmark = BENCHMARKS[key] || BENCHMARKS['tables_medium'];
  
  // Find the tier strictly above current score
  const reversed = [...benchmark.tiers].reverse();
  for (const tier of reversed) {
    if (tier.minScore > score) {
      return tier;
    }
  }
  return null;
}
