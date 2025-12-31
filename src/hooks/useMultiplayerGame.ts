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
  timeRemaining: number;
  isQuestionLocked: boolean;
  roundPhase: "waiting" | "question-master-input" | "guessing" | "round-result" | "game-complete";
  correctGuessOrder: string[]; // Player IDs in order of correct guesses
}

const ROUND_DURATION = 120;
const POINTS_FIRST = 10;
const POINTS_SECOND = 7;
const POINTS_THIRD = 5;
const POINTS_QM_NO_GUESS = 10;

// Fuzzy matching function - accepts close spellings
const fuzzyMatch = (input: string, target: string): boolean => {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const normalInput = normalize(input);
  const normalTarget = normalize(target);
  
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

export const useMultiplayerGame = (currentPlayerId: string) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const qmRotationRef = useRef<string[]>([]);
  
  const [state, setState] = useState<MultiplayerGameState>({
    players: [],
    currentRound: 0,
    totalRounds: 0,
    questionMasterId: null,
    question: null,
    currentHint: 0,
    timeRemaining: ROUND_DURATION,
    isQuestionLocked: false,
    roundPhase: "waiting",
    correctGuessOrder: [],
  });

  // Initialize game with players
  const initializeGame = useCallback((players: MultiplayerPlayer[]) => {
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
      timeRemaining: ROUND_DURATION,
      isQuestionLocked: false,
      roundPhase: "waiting",
      correctGuessOrder: [],
    });
  }, []);

  // Start next round
  const startRound = useCallback(() => {
    const nextRound = state.currentRound + 1;
    if (nextRound > state.totalRounds) {
      setState(prev => ({ ...prev, roundPhase: "game-complete" }));
      return;
    }

    const nextQmId = qmRotationRef.current[nextRound - 1];
    
    setState(prev => ({
      ...prev,
      currentRound: nextRound,
      questionMasterId: nextQmId,
      question: null,
      currentHint: 0,
      timeRemaining: ROUND_DURATION,
      isQuestionLocked: false,
      roundPhase: "question-master-input",
      correctGuessOrder: [],
      players: prev.players.map(p => ({
        ...p,
        hasAnswered: false,
        answer: null,
        isCorrect: null,
      })),
    }));
  }, [state.currentRound, state.totalRounds]);

  // Question Master submits question
  const submitQuestion = useCallback((question: RoundQuestion) => {
    setState(prev => ({
      ...prev,
      question,
      isQuestionLocked: true,
      roundPhase: "guessing",
      timeRemaining: ROUND_DURATION,
    }));
  }, []);

  // Start timer for guessing phase
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reveal next hint
  const revealNextHint = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentHint: Math.min(prev.currentHint + 1, 2),
    }));
  }, []);

  // Player submits answer
  const submitAnswer = useCallback((playerId: string, answer: string) => {
    if (!state.question || state.roundPhase !== "guessing") return;
    
    const isCorrect = fuzzyMatch(answer, state.question.answer);
    
    setState(prev => {
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
  }, [state.question, state.roundPhase]);

  // Check if round should end
  const checkRoundEnd = useCallback(() => {
    const guessingPlayers = state.players.filter(
      p => p.id !== state.questionMasterId && p.isConnected
    );
    const allAnswered = guessingPlayers.every(p => p.hasAnswered);
    const timerEnded = state.timeRemaining <= 0;
    
    return allAnswered || timerEnded;
  }, [state.players, state.questionMasterId, state.timeRemaining]);

  // End round and calculate QM bonus
  const endRound = useCallback(() => {
    stopTimer();
    
    setState(prev => {
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
    setState({
      players: [],
      currentRound: 0,
      totalRounds: 0,
      questionMasterId: null,
      question: null,
      currentHint: 0,
      timeRemaining: ROUND_DURATION,
      isQuestionLocked: false,
      roundPhase: "waiting",
      correctGuessOrder: [],
    });
  }, [stopTimer]);

  // Get current player
  const getCurrentPlayer = useCallback(() => {
    return state.players.find(p => p.id === currentPlayerId);
  }, [state.players, currentPlayerId]);

  // Check if current player is Question Master
  const isQuestionMaster = useCallback(() => {
    return state.questionMasterId === currentPlayerId;
  }, [state.questionMasterId, currentPlayerId]);

  // Get Question Master
  const getQuestionMaster = useCallback(() => {
    return state.players.find(p => p.id === state.questionMasterId);
  }, [state.players, state.questionMasterId]);

  // Get winner(s)
  const getWinners = useCallback(() => {
    if (state.players.length === 0) return [];
    const maxScore = Math.max(...state.players.map(p => p.score));
    return state.players.filter(p => p.score === maxScore);
  }, [state.players]);

  // Get sorted leaderboard
  const getLeaderboard = useCallback(() => {
    return [...state.players].sort((a, b) => b.score - a.score);
  }, [state.players]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-end round when conditions are met
  useEffect(() => {
    if (state.roundPhase === "guessing" && checkRoundEnd()) {
      endRound();
    }
  }, [state.roundPhase, checkRoundEnd, endRound]);

  return {
    ...state,
    initializeGame,
    startRound,
    submitQuestion,
    startTimer,
    stopTimer,
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
