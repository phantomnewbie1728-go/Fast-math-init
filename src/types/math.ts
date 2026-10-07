export type GameMode = 'tables' | 'add_sub' | 'two_by_two';
export type SubMode = 'add' | 'sub';
export type Difficulty = 'medium' | 'hard';

export interface Question {
  id: string;
  operand1: number;
  operand2: number;
  operator: '+' | '-' | '×';
  correctAnswer: number;
  text: string;
}

export interface AnswerLog {
  question: Question;
  userAnswer: number | null;
  isCorrect: boolean;
  timeTakenMs: number;
}

export interface RoundStats {
  id: string;
  timestamp: number;
  mode: GameMode;
  subMode?: SubMode;
  difficulty: Difficulty;
  totalQuestionsAttempted: number;
  correctAnswers: number;
  wrongAnswers: number;
  timedOutCount: number;
  accuracy: number;
  averageTimeMs: number;
  bestStreak: number;
  answers: AnswerLog[];
  isNewPersonalBest: boolean;
  benchmarkRank: string;
}

export interface BenchmarkTier {
  rank: 'Novice' | 'Competitor' | 'Pro' | 'Grandmaster' | 'Legend';
  minScore: number;
  description: string;
}

export interface ModeRecord {
  bestScore: number;
  bestStreak: number;
  totalAttempted: number;
  totalCorrect: number;
  lastPlayed: number;
}

export type AllRecords = Record<string, ModeRecord>;
