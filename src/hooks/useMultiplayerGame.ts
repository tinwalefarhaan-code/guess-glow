import { useState, useCallback, useRef, useEffect } from "react";
import { Category } from "@/components/CategoryCard";

export interface MultiplayerPlayer {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  hasAnswered: boolean;
  answer: string | null;
  isCorrect: boolean | null;
  isConnected: boolean;
}

export interface RoundQuestion {
  category: Category;
  answer: string;
  hints: [string, string, string];
  hasOptions: boolean;
  options: string[];
}

export interface MultiplayerGameState {
  players: MultiplayerPlayer[];
  currentRound: number;
  totalRounds: number;
  questionMasterId: string | null;
  question: RoundQuestion | null;
  currentHint: number;
  unlockedHints: boolean[];
  timeRemaining: number;
  isQuestionLocked: boolean;
  roundPhase: "waiting" | "question-master-input" | "guessing" | "round-result" | "game-complete";
  correctGuessOrder: string[];
  roundStartTime: number;
}

const ROUND_DURATION = 240; // 4 minutes
const POINTS_FIRST = 10;
const POINTS_SECOND = 7;
const POINTS_THIRD = 5;
const POINTS_QM_NO_GUESS = 10;
const HINT_2_AUTO_UNLOCK = 60; // seconds
const HINT_3_AUTO_UNLOCK = 120; // seconds

// Fuzzy matching function - accepts close spellings
const fuzzyMatch = (input: string, target: string): boolean => {
  if (!input || !target) return false;
  
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const normalInput = normalize(input);
  const normalTarget = normalize(target);
  
  if (!normalInput || !normalTarget) return false;
  
  // Exact match
  if (normalInput === normalTarget) return true;
  
  // Allow 1-2 character differences for longer words
  if (normalTarget.length >= 5) {
    let differences = 0;
    const minLen = Math.min(normalInput.length, normalTarget.length);
    const maxLen = Math.max(normalInput.length, normalTarget.length);
    
    // Length difference counts as differences
    differences += maxLen - minLen;
    
    // Character differences
    for (let i = 0; i < minLen; i++) {
      if (normalInput[i] !== normalTarget[i]) {
        differences++;
      }
    }
    
    // Allow up to 2 differences for words 5+ chars, 1 for shorter
    const allowedDiff = normalTarget.length >= 7 ? 2 : 1;
    if (differences <= allowedDiff) return true;
  }
  
  // Check if input contains target or vice versa (for compound words)
  if (normalInput.includes(normalTarget) || normalTarget.includes(normalInput)) {
    return true;
  }
  
  return false;
};

const createInitialState = (): MultiplayerGameState => ({
  players: [],
  currentRound: 0,
  totalRounds: 0,
  questionMasterId: null,
  question: null,
  currentHint: 0,
  unlockedHints: [true, false, false],
  timeRemaining: ROUND_DURATION,
  isQuestionLocked: false,
  roundPhase: "waiting",
  correctGuessOrder: [],
  roundStartTime: 0,
});

export const useMultiplayerGame = (currentPlayerId: string) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const qmRotationRef = useRef<string[]>([]);
  
  const [state, setState] = useState<MultiplayerGameState>(createInitialState());

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Initialize game with players
  const initializeGame = useCallback((players: MultiplayerPlayer[]) => {
    if (!players || players.length === 0) return;
    
    const totalRounds = players.length;
    // Shuffle players for QM rotation
    const shuffledIds = [...players.map(p => p.id)].sort(() => Math.random() - 0.5);
    qmRotationRef.current = shuffledIds;
    
    setState({
      players: players.map(p => ({ ...p, score: 0, hasAnswered: false, answer: null, isCorrect: null })),
      currentRound: 0,
      totalRounds,
      questionMasterId: null,
      question: null,
      currentHint: 0,
      unlockedHints: [true, false, false],
      timeRemaining: ROUND_DURATION,
      isQuestionLocked: false,
      roundPhase: "waiting",
      correctGuessOrder: [],
      roundStartTime: 0,
    });
  }, []);

  // Stop timer safely
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start next round
  const startRound = useCallback(() => {
    stopTimer();
    
    setState(prev => {
      const nextRound = prev.currentRound + 1;
      if (nextRound > prev.totalRounds || prev.totalRounds === 0) {
        return { ...prev, roundPhase: "game-complete" };
      }

      const nextQmId = qmRotationRef.current[nextRound - 1] || prev.players[0]?.id;
      
      return {
        ...prev,
        currentRound: nextRound,
        questionMasterId: nextQmId,
        question: null,
        currentHint: 0,
        unlockedHints: [true, false, false],
        timeRemaining: ROUND_DURATION,
        isQuestionLocked: false,
        roundPhase: "question-master-input",
        correctGuessOrder: [],
        roundStartTime: 0,
        players: prev.players.map(p => ({
          ...p,
          hasAnswered: false,
          answer: null,
          isCorrect: null,
        })),
      };
    });
  }, [stopTimer]);

  // Question Master submits question
  const submitQuestion = useCallback((question: RoundQuestion) => {
    if (!question || !question.answer || !question.hints) return;
    
    setState(prev => ({
      ...prev,
      question,
      isQuestionLocked: true,
      roundPhase: "guessing",
      timeRemaining: ROUND_DURATION,
      currentHint: 0,
      unlockedHints: [true, false, false],
      roundStartTime: Date.now(),
    }));
  }, []);

  // Unlock a specific hint (for multiplayer, QM controls this)
  const unlockHint = useCallback((hintIndex: number) => {
    setState(prev => {
      if (hintIndex < 0 || hintIndex > 2) return prev;
      if (prev.unlockedHints[hintIndex]) return prev;
      
      const newUnlockedHints = [...prev.unlockedHints];
      newUnlockedHints[hintIndex] = true;
      
      return {
        ...prev,
        unlockedHints: newUnlockedHints,
        currentHint: hintIndex,
      };
    });
  }, []);

  // Reveal next hint (for Question Master)
  const revealNextHint = useCallback(() => {
    setState(prev => {
      const nextHint = prev.currentHint + 1;
      if (nextHint > 2) return prev;
      
      const newUnlockedHints = [...prev.unlockedHints];
      newUnlockedHints[nextHint] = true;
      
      return {
        ...prev,
        currentHint: nextHint,
        unlockedHints: newUnlockedHints,
      };
    });
  }, []);

  // Start timer for guessing phase
  const startTimer = useCallback(() => {
    stopTimer();

    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.roundPhase !== "guessing") {
          return prev;
        }
        
        const newTime = prev.timeRemaining - 1;
        
        // Auto-unlock hints based on time elapsed
        const elapsed = (Date.now() - prev.roundStartTime) / 1000;
        const newUnlockedHints = [...prev.unlockedHints];
        let newCurrentHint = prev.currentHint;
        
        if (elapsed >= HINT_2_AUTO_UNLOCK && !prev.unlockedHints[1]) {
          newUnlockedHints[1] = true;
          newCurrentHint = Math.max(newCurrentHint, 1);
        }
        if (elapsed >= HINT_3_AUTO_UNLOCK && !prev.unlockedHints[2]) {
          newUnlockedHints[2] = true;
          newCurrentHint = Math.max(newCurrentHint, 2);
        }
        
        if (newTime <= 0) {
          return { 
            ...prev, 
            timeRemaining: 0,
            unlockedHints: newUnlockedHints,
            currentHint: newCurrentHint,
          };
        }
        
        return { 
          ...prev, 
          timeRemaining: newTime,
          unlockedHints: newUnlockedHints,
          currentHint: newCurrentHint,
        };
      });
    }, 1000);
  }, [stopTimer]);

  // End round and calculate QM bonus
  const endRound = useCallback(() => {
    stopTimer();
    
    setState(prev => {
      if (prev.roundPhase === "round-result" || prev.roundPhase === "game-complete") {
        return prev;
      }
      
      // If no one guessed correctly, QM gets points
      const qmBonus = prev.correctGuessOrder.length === 0 ? POINTS_QM_NO_GUESS : 0;
      
      return {
        ...prev,
        roundPhase: "round-result",
        players: prev.players.map(p =>
          p.id === prev.questionMasterId && qmBonus > 0
            ? { ...p, score: p.score + qmBonus }
            : p
        ),
      };
    });
  }, [stopTimer]);

  // Player submits answer
  const submitAnswer = useCallback((playerId: string, answer: string) => {
    if (!playerId || !answer) return;
    
    setState(prev => {
      if (!prev.question || prev.roundPhase !== "guessing") return prev;
      
      const player = prev.players.find(p => p.id === playerId);
      if (!player || player.hasAnswered) return prev;
      
      const isCorrect = fuzzyMatch(answer, prev.question.answer);
      
      const newCorrectOrder = [...prev.correctGuessOrder];
      if (isCorrect && !newCorrectOrder.includes(playerId)) {
        newCorrectOrder.push(playerId);
      }
      
      // Calculate points for this answer
      let points = 0;
      if (isCorrect) {
        const position = newCorrectOrder.indexOf(playerId);
        if (position === 0) points = POINTS_FIRST;
        else if (position === 1) points = POINTS_SECOND;
        else if (position === 2) points = POINTS_THIRD;
      }
      
      return {
        ...prev,
        correctGuessOrder: newCorrectOrder,
        players: prev.players.map(p =>
          p.id === playerId
            ? { ...p, hasAnswered: true, answer, isCorrect, score: p.score + points }
            : p
        ),
      };
    });
  }, []);

  // Check if round should end
  const checkRoundEnd = useCallback(() => {
    const guessingPlayers = state.players.filter(
      p => p.id !== state.questionMasterId && p.isConnected
    );
    
    if (guessingPlayers.length === 0) return true;
    
    const allAnswered = guessingPlayers.every(p => p.hasAnswered);
    const timerEnded = state.timeRemaining <= 0;
    
    return allAnswered || timerEnded;
  }, [state.players, state.questionMasterId, state.timeRemaining]);

  // Auto-end round when conditions are met
  useEffect(() => {
    if (state.roundPhase === "guessing" && checkRoundEnd()) {
      endRound();
    }
  }, [state.roundPhase, checkRoundEnd, endRound]);

  // Mark player as disconnected
  const disconnectPlayer = useCallback((playerId: string) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? { ...p, isConnected: false, hasAnswered: true } : p
      ),
    }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    stopTimer();
    qmRotationRef.current = [];
    setState(createInitialState());
  }, [stopTimer]);

  // Get current player
  const getCurrentPlayer = useCallback((): MultiplayerPlayer | undefined => {
    return state.players.find(p => p.id === currentPlayerId);
  }, [state.players, currentPlayerId]);

  // Check if current player is Question Master
  const isQuestionMaster = useCallback((): boolean => {
    return state.questionMasterId === currentPlayerId;
  }, [state.questionMasterId, currentPlayerId]);

  // Get Question Master
  const getQuestionMaster = useCallback((): MultiplayerPlayer | undefined => {
    return state.players.find(p => p.id === state.questionMasterId);
  }, [state.players, state.questionMasterId]);

  // Get winner(s)
  const getWinners = useCallback((): MultiplayerPlayer[] => {
    if (state.players.length === 0) return [];
    const maxScore = Math.max(...state.players.map(p => p.score), 0);
    return state.players.filter(p => p.score === maxScore);
  }, [state.players]);

  // Get sorted leaderboard
  const getLeaderboard = useCallback((): MultiplayerPlayer[] => {
    return [...state.players].sort((a, b) => b.score - a.score);
  }, [state.players]);

  return {
    ...state,
    initializeGame,
    startRound,
    submitQuestion,
    startTimer,
    stopTimer,
    unlockHint,
    revealNextHint,
    submitAnswer,
    endRound,
    disconnectPlayer,
    resetGame,
    getCurrentPlayer,
    isQuestionMaster,
    getQuestionMaster,
    getWinners,
    getLeaderboard,
    ROUND_DURATION,
  };
};