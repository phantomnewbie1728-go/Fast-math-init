/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AnswerLog, Difficulty, GameMode, Question, RoundStats, SubMode } from './types/math';
import { generateQuestion } from './utils/mathGenerator';
import {
  initAudio,
  isSoundEnabled,
  playCorrectTone,
  playErrorTone,
  playKeyClick,
  playRoundFinishTone,
  setSoundEnabled,
} from './utils/audio';
import {
  getRecord,
  loadRecords,
  loadSettings,
  saveSettings,
  updateRecordWithRound,
  loadHistory,
} from './utils/storage';
import { getBenchmarkTier } from './utils/benchmarks';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { GameHUD } from './components/GameHUD';
import { NumberPad } from './components/NumberPad';
import { RoundSummary } from './components/RoundSummary';
import { BenchmarksModal } from './components/BenchmarksModal';
import { RecordsModal } from './components/RecordsModal';

type AppState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'SUMMARY';

export default function App() {
  // App & User configuration state
  const [appState, setAppState] = useState<AppState>('MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<GameMode>('tables');
  const [activeSubMode, setActiveSubMode] = useState<SubMode>('add');

  // Modals state
  const [isBenchmarksOpen, setIsBenchmarksOpen] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [records, setRecords] = useState(loadRecords());
  const [history, setHistory] = useState(loadHistory());

  // Countdown state before start
  const [countdownValue, setCountdownValue] = useState<number>(3);

  // Active Game State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [timedOutCount, setTimedOutCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Timers
  const [timeLeftMs, setTimeLeftMs] = useState<number>(60000);
  const [maxTimeMs, setMaxTimeMs] = useState<number>(60000);

  // Logs for summary
  const [answersLog, setAnswersLog] = useState<AnswerLog[]>([]);
  const [lastSummary, setLastSummary] = useState<RoundStats | null>(null);

  // Timestamps
  const questionStartTimeRef = useRef<number>(Date.now());
  const roundStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  // Load initial settings
  useEffect(() => {
    const settings = loadSettings();
    setDifficulty(settings.difficulty);
    setSoundActive(settings.soundEnabled);
    setSoundEnabled(settings.soundEnabled);
    setRecords(loadRecords());
    setHistory(loadHistory());
  }, []);

  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    saveSettings({
      difficulty: newDiff,
      soundEnabled: soundActive,
      autoSubmitOnMatch: true,
    });
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    saveSettings({
      difficulty,
      soundEnabled: next,
      autoSubmitOnMatch: true,
    });
  };

  const refreshTelemetry = () => {
    setRecords(loadRecords());
    setHistory(loadHistory());
  };

  // Conclude the round and generate performance summary
  const finishRound = useCallback(
    (reason: 'time_up' | 'quit' | 'timeout') => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      playRoundFinishTone();

      const totalAttempted = answersLog.length;
      const totalCorrect = solvedCount;
      const totalWrong = wrongCount;
      const accuracy =
        totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

      const totalSolveDuration = answersLog.reduce((acc, log) => acc + log.timeTakenMs, 0);
      const averageTimeMs =
        totalAttempted > 0 ? Math.round(totalSolveDuration / totalAttempted) : 0;

      const currentTier = getBenchmarkTier(
        totalCorrect,
        activeMode,
        activeMode === 'add_sub' ? activeSubMode : undefined,
        difficulty
      );

      const roundStats: RoundStats = {
        id: `round_${Date.now()}`,
        timestamp: Date.now(),
        mode: activeMode,
        subMode: activeMode === 'add_sub' ? activeSubMode : undefined,
        difficulty,
        totalQuestionsAttempted: totalAttempted,
        correctAnswers: totalCorrect,
        wrongAnswers: totalWrong,
        timedOutCount: reason === 'timeout' ? timedOutCount + 1 : timedOutCount,
        accuracy,
        averageTimeMs,
        bestStreak: Math.max(bestStreak, streak),
        answers: answersLog,
        isNewPersonalBest: false,
        benchmarkRank: currentTier.rank,
      };

      const { isNewPB } = updateRecordWithRound(roundStats);
      roundStats.isNewPersonalBest = isNewPB;

      setLastSummary(roundStats);
      refreshTelemetry();
      setAppState('SUMMARY');
    },
    [
      answersLog,
      solvedCount,
      wrongCount,
      timedOutCount,
      activeMode,
      activeSubMode,
      difficulty,
      bestStreak,
      streak,
    ]
  );

  // Setup and begin a match
  const startRound = useCallback(
    (mode: GameMode, subMode?: SubMode) => {
      initAudio();
      setActiveMode(mode);
      if (subMode) setActiveSubMode(subMode);

      setAppState('COUNTDOWN');
      setCountdownValue(3);

      const firstQ = generateQuestion(mode, subMode, difficulty);
      setCurrentQuestion(firstQ);
      setInputAnswer('');
      setSolvedCount(0);
      setWrongCount(0);
      setTimedOutCount(0);
      setStreak(0);
      setBestStreak(0);
      setAnswersLog([]);
      setLastFeedback(null);

      const totalTime = mode === 'two_by_two' ? 10000 : 60000;
      setTimeLeftMs(totalTime);
      setMaxTimeMs(totalTime);
    },
    [difficulty]
  );

  // Countdown timer logic
  useEffect(() => {
    if (appState !== 'COUNTDOWN') return;

    if (countdownValue > 1) {
      const timer = setTimeout(() => {
        setCountdownValue((v) => v - 1);
        playKeyClick();
      }, 700);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setAppState('PLAYING');
        roundStartTimeRef.current = Date.now();
        questionStartTimeRef.current = Date.now();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [appState, countdownValue]);

  // Main active game loop timer
  useEffect(() => {
    if (appState !== 'PLAYING') return;

    const interval = window.setInterval(() => {
      setTimeLeftMs((prev) => {
        if (activeMode === 'two_by_two') {
          // Per-question 10s countdown
          if (prev <= 100) {
            playErrorTone();
            if (currentQuestion) {
              setAnswersLog((logs) => [
                ...logs,
                {
                  question: currentQuestion,
                  userAnswer: null,
                  isCorrect: false,
                  timeTakenMs: 10000,
                },
              ]);
            }
            finishRound('timeout');
            return 0;
          }
          return prev - 100;
        } else {
          // Global 60s countdown
          if (prev <= 100) {
            finishRound('time_up');
            return 0;
          }
          return prev - 100;
        }
      });
    }, 100);

    timerIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [appState, activeMode, currentQuestion, finishRound]);

  // Handle Answer Verification
  const processAnswer = useCallback(
    (submittedText: string) => {
      if (!currentQuestion || appState !== 'PLAYING') return;

      const userNum = parseInt(submittedText, 10);
      const isCorrect = !isNaN(userNum) && userNum === currentQuestion.correctAnswer;
      const timeTakenMs = Date.now() - questionStartTimeRef.current;

      const logItem: AnswerLog = {
        question: currentQuestion,
        userAnswer: isNaN(userNum) ? null : userNum,
        isCorrect,
        timeTakenMs,
      };

      setAnswersLog((prev) => [...prev, logItem]);

      if (isCorrect) {
        playCorrectTone();
        setSolvedCount((c) => c + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
        setLastFeedback('correct');

        // Reset timer if 2x2 Blitz (10s)
        if (activeMode === 'two_by_two') {
          setTimeLeftMs(10000);
        }

        // Generate next question
        const nextQ = generateQuestion(
          activeMode,
          activeMode === 'add_sub' ? activeSubMode : undefined,
          difficulty,
          currentQuestion
        );
        setCurrentQuestion(nextQ);
        setInputAnswer('');
        questionStartTimeRef.current = Date.now();
      } else {
        playErrorTone();
        setWrongCount((w) => w + 1);
        setStreak(0);
        setLastFeedback('wrong');

        if (activeMode === 'two_by_two') {
          // In 2x2 sudden death, wrong answer concludes run!
          finishRound('timeout');
          return;
        } else {
          // For tables / add / sub, advance to next question so player doesn't stall
          const nextQ = generateQuestion(
            activeMode,
            activeMode === 'add_sub' ? activeSubMode : undefined,
            difficulty,
            currentQuestion
          );
          setCurrentQuestion(nextQ);
          setInputAnswer('');
          questionStartTimeRef.current = Date.now();
        }
      }

      setTimeout(() => {
        setLastFeedback(null);
      }, 180);
    },
    [currentQuestion, appState, activeMode, activeSubMode, difficulty, finishRound]
  );

  // Keypad Handlers
  const handleDigit = useCallback(
    (digit: string) => {
      if (appState !== 'PLAYING') return;
      playKeyClick();

      setInputAnswer((prev) => {
        const next = (prev + digit).slice(0, 5); // Limit to 5 digits max
        // Immediate match auto-advance check
        if (currentQuestion && parseInt(next, 10) === currentQuestion.correctAnswer) {
          setTimeout(() => processAnswer(next), 10);
        }
        return next;
      });
    },
    [appState, currentQuestion, processAnswer]
  );

  const handleBackspace = useCallback(() => {
    if (appState !== 'PLAYING') return;
    playKeyClick();
    setInputAnswer((prev) => prev.slice(0, -1));
  }, [appState]);

  const handleClear = useCallback(() => {
    if (appState !== 'PLAYING') return;
    playKeyClick();
    setInputAnswer('');
  }, [appState]);

  const handleSubmit = useCallback(() => {
    if (appState !== 'PLAYING' || !inputAnswer) return;
    processAnswer(inputAnswer);
  }, [appState, inputAnswer, processAnswer]);

  // Current PB for active mode
  const currentRecord = getRecord(
    activeMode,
    activeMode === 'add_sub' ? activeSubMode : undefined,
    difficulty
  );
  const personalBest = currentRecord ? currentRecord.bestScore : 0;

  // DEDICATED FULL-SCREEN PLAYING VIEW (ZERO SPACE AT BOTTOM, QUESTION IS HERO)
  if (appState === 'PLAYING' && currentQuestion) {
    const modeLabel =
      activeMode === 'tables'
        ? 'Tables'
        : activeMode === 'add_sub'
        ? activeSubMode === 'add'
          ? 'Addition'
          : 'Subtraction'
        : '2×2 Blitz';

    return (
      <div className="fixed inset-0 h-dvh w-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none touch-none z-50">
        {/* Minimal Playing Header (Single Bar, No Mode Switchers) */}
        <header className="h-11 w-full border-b border-neutral-900 bg-black/95 px-3 sm:px-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              setAppState('MENU');
            }}
            className="text-xs uppercase font-mono tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1 border border-neutral-800 px-2.5 py-1 cursor-pointer"
          >
            ← Exit
          </button>

          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider font-semibold">
            {modeLabel} · {difficulty}
          </span>

          <button
            onClick={handleToggleSound}
            className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white p-1.5 transition-colors"
            title={soundActive ? 'Mute' : 'Unmute'}
          >
            {soundActive ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-600" />
            )}
          </button>
        </header>

        {/* Top Half: The Question Hero */}
        <div className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-between min-h-0">
          <GameHUD
            mode={activeMode}
            subMode={activeSubMode}
            difficulty={difficulty}
            timeLeftMs={timeLeftMs}
            maxTimeMs={maxTimeMs}
            currentQuestion={currentQuestion}
            inputAnswer={inputAnswer}
            solvedCount={solvedCount}
            streak={streak}
            personalBest={personalBest}
            lastFeedback={lastFeedback}
          />
        </div>

        {/* Bottom Half: NumberPad DOCKED AND CLIPPED TO THE VERY BOTTOM */}
        <div
          className="h-[52dvh] sm:h-[360px] w-full max-w-lg mx-auto shrink-0 p-1"
          style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom, 4px))' }}
        >
          <NumberPad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-neutral-800">
      {/* Universal Top Bar - Mode switcher ONLY rendered on MENU homescreen */}
      <Header
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        onOpenRecords={() => setIsRecordsOpen(true)}
        onOpenBenchmarks={() => setIsBenchmarksOpen(true)}
        isGameActive={false}
        showDifficultyControls={appState === 'MENU'}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-6">
        {/* State 1: Mode Selection Menu (HOMESCREEN ONLY) */}
        {appState === 'MENU' && (
          <ModeSelector
            difficulty={difficulty}
            onSelectMode={(mode, sub) => startRound(mode, sub)}
            selectedSubMode={activeSubMode}
            onSubModeChange={(sub) => setActiveSubMode(sub)}
          />
        )}

        {/* State 2: 3-2-1 Countdown */}
        {appState === 'COUNTDOWN' && (
          <div className="flex flex-col items-center justify-center space-y-4 font-mono select-none">
            <div className="text-xs uppercase tracking-widest text-neutral-400">
              Get Ready
            </div>
            <div className="text-8xl sm:text-9xl font-bold tracking-tight text-white tabular-nums animate-pulse">
              {countdownValue}
            </div>
            <div className="text-xs text-neutral-400 pt-4">
              Mode:{' '}
              <strong className="text-white uppercase">
                {activeMode === 'tables'
                  ? 'Tables (60s)'
                  : activeMode === 'add_sub'
                  ? `${activeSubMode} (60s)`
                  : '2×2 Blitz (10s)'}
              </strong>
            </div>
          </div>
        )}

        {/* State 4: Round Performance Summary */}
        {appState === 'SUMMARY' && lastSummary && (
          <RoundSummary
            stats={lastSummary}
            onPlayAgain={() => startRound(activeMode, activeSubMode)}
            onBackToMenu={() => setAppState('MENU')}
          />
        )}
      </main>

      {/* Global Minimal Footer */}
      <footer className="w-full border-t border-neutral-900 py-3 px-4 sm:px-6 text-center text-xs font-mono text-neutral-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Arithmo Mental Arithmetic Engine · Client-Side Competitive Benchmark</span>
          <span>Zero network latency · Offline compliant</span>
        </div>
      </footer>

      {/* Benchmark Standards Modal */}
      <BenchmarksModal
        isOpen={isBenchmarksOpen}
        onClose={() => setIsBenchmarksOpen(false)}
        defaultDifficulty={difficulty}
      />

      {/* Personal Records & History Modal */}
      <RecordsModal
        isOpen={isRecordsOpen}
        onClose={() => setIsRecordsOpen(false)}
        records={records}
        history={history}
        onRefreshRecords={refreshTelemetry}
      />
    </div>
  );
}
