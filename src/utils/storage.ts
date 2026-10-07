import { AllRecords, Difficulty, GameMode, ModeRecord, RoundStats, SubMode } from '../types/math';
import { getBenchmarkKey } from './benchmarks';

const RECORDS_KEY = 'arithmo_records_v1';
const HISTORY_KEY = 'arithmo_history_v1';
const SETTINGS_KEY = 'arithmo_settings_v1';

export interface UserSettings {
  difficulty: Difficulty;
  soundEnabled: boolean;
  autoSubmitOnMatch: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  difficulty: 'medium',
  soundEnabled: true,
  autoSubmitOnMatch: true,
};

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadRecords(): AllRecords {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getRecord(mode: GameMode, subMode: SubMode | undefined, difficulty: Difficulty): ModeRecord | null {
  const records = loadRecords();
  const key = getBenchmarkKey(mode, subMode, difficulty);
  return records[key] || null;
}

export function updateRecordWithRound(round: RoundStats): { isNewPB: boolean; previousPB: number } {
  const records = loadRecords();
  const key = getBenchmarkKey(round.mode, round.subMode, round.difficulty);
  const current = records[key] || {
    bestScore: 0,
    bestStreak: 0,
    totalAttempted: 0,
    totalCorrect: 0,
    lastPlayed: 0,
  };

  const isNewPB = round.correctAnswers > current.bestScore;
  const previousPB = current.bestScore;

  records[key] = {
    bestScore: Math.max(current.bestScore, round.correctAnswers),
    bestStreak: Math.max(current.bestStreak, round.bestStreak),
    totalAttempted: current.totalAttempted + round.totalQuestionsAttempted,
    totalCorrect: current.totalCorrect + round.correctAnswers,
    lastPlayed: round.timestamp,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
      
      // Also save to history (keep latest 30 rounds)
      const rawHistory = localStorage.getItem(HISTORY_KEY);
      const history: RoundStats[] = rawHistory ? JSON.parse(rawHistory) : [];
      history.unshift(round);
      if (history.length > 30) history.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }

  return { isNewPB, previousPB };
}

export function loadHistory(): RoundStats[] {
  if (typeof window === 'undefined') return [];
  try {
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    return rawHistory ? JSON.parse(rawHistory) : [];
  } catch {
    return [];
  }
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
