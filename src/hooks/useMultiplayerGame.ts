import { useState, useCallback, useRef, useEffect } from "react";
import { Category } from "@/components/CategoryCard";
import { Room, RoomPlayer } from "@/hooks/useMultiplayerRoom";

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

export interface SyncedGameState {
  currentRoundIndex: number;
  totalRounds: number;
  questionMasterId: string | null;
  question: RoundQuestion | null;
  puzzleReady: boolean;
  currentHint: number;
  unlockedHints: boolean[];
  timeRemaining: number;
  roundPhase: "waiting" | "question-master-input" | "guessing" | "round-result" | "game-complete";
  playerAnswers: Record<string, { answer: string; isCorrect: boolean; answeredAt: number }>;
  correctGuessOrder: string[];
  roundStartTime: number;
  qmInputStartTime: number; // Track when QM started inputting (for timeout)
  playerOrder: string[]; // Fixed order of player IDs for QM rotation
}

const ROUND_DURATION = 240; // 4 minutes
const QM_TIMEOUT = 180; // 3 minutes for QM to input question
const POINTS_FIRST = 10;
const POINTS_SECOND = 7;
const POINTS_THIRD = 5;
const POINTS_QM_NO_GUESS = 10;
const HINT_2_AUTO_UNLOCK = 60;
const HINT_3_AUTO_UNLOCK = 120;

// Fuzzy matching function
const fuzzyMatch = (input: string, target: string): boolean => {
  if (!input || !target) return false;
  
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const normalInput = normalize(input);
  const normalTarget = normalize(target);
  
  if (!normalInput || !normalTarget) return false;
  if (normalInput === normalTarget) return true;
  
  if (normalTarget.length >= 5) {
    let differences = 0;
    const minLen = Math.min(normalInput.length, normalTarget.length);
    const maxLen = Math.max(normalInput.length, normalTarget.length);
    differences += maxLen - minLen;
    
    for (let i = 0; i < minLen; i++) {
      if (normalInput[i] !== normalTarget[i]) {
        differences++;
      }
    }
    
    const allowedDiff = normalTarget.length >= 7 ? 2 : 1;
    if (differences <= allowedDiff) return true;
  }
  
  if (normalInput.includes(normalTarget) || normalTarget.includes(normalInput)) {
    return true;
  }
  
  return false;
};

export const createInitialSyncedState = (): SyncedGameState => ({
  currentRoundIndex: 0,
  totalRounds: 0,
  questionMasterId: null,
  question: null,
  puzzleReady: false,
  currentHint: 0,
  unlockedHints: [true, false, false],
  timeRemaining: ROUND_DURATION,
  roundPhase: "waiting",
  playerAnswers: {},
  correctGuessOrder: [],
  roundStartTime: 0,
  qmInputStartTime: 0,
  playerOrder: [],
});

export const useMultiplayerGame = (
  currentPlayerId: string,
  room: Room | null,
  players: RoomPlayer[],
  updateGameState: (state: Record<string, unknown>) => Promise<boolean>,
  updatePlayerScore: (playerId: string, score: number) => Promise<boolean>
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const qmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Parse game state from room
  const gameState: SyncedGameState = room?.game_state 
    ? { ...createInitialSyncedState(), ...(room.game_state as unknown as SyncedGameState) }
    : createInitialSyncedState();

  // Build player data with scores from database
  const gamePlayers: MultiplayerPlayer[] = players.map(p => {
    const playerAnswer = gameState.playerAnswers[p.player_id];
    return {
      id: p.player_id,
      name: p.name,
      isHost: p.is_host,
      score: p.score,
      hasAnswered: !!playerAnswer,
      answer: playerAnswer?.answer || null,
      isCorrect: playerAnswer?.isCorrect ?? null,
      isConnected: p.is_connected,
    };
  });

  // Determine Question Master from player order
  const getQuestionMasterIdForRound = useCallback((roundIndex: number): string | null => {
    if (gameState.playerOrder.length === 0) return null;
    const idx = (roundIndex - 1) % gameState.playerOrder.length;
    return gameState.playerOrder[idx] || null;
  }, [gameState.playerOrder]);

  // Check if current player is Question Master
  const isQuestionMaster = useCallback((): boolean => {
    return gameState.questionMasterId === currentPlayerId;
  }, [gameState.questionMasterId, currentPlayerId]);

  // Get current player
  const getCurrentPlayer = useCallback((): MultiplayerPlayer | undefined => {
    return gamePlayers.find(p => p.id === currentPlayerId);
  }, [gamePlayers, currentPlayerId]);

  // Get Question Master player
  const getQuestionMaster = useCallback((): MultiplayerPlayer | undefined => {
    return gamePlayers.find(p => p.id === gameState.questionMasterId);
  }, [gamePlayers, gameState.questionMasterId]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Stop QM timeout
  const stopQmTimeout = useCallback(() => {
    if (qmTimeoutRef.current) {
      clearTimeout(qmTimeoutRef.current);
      qmTimeoutRef.current = null;
    }
  }, []);

  // Initialize game with players (called by host when starting)
  const initializeGame = useCallback(async () => {
    const connectedPlayers = players.filter(p => p.is_connected);
    if (connectedPlayers.length === 0) return false;
    
    // Create fixed player order for QM rotation (use the order they appear in the players array)
    const playerOrder = connectedPlayers
      .map(p => p.player_id);
    
    const totalRounds = playerOrder.length;
    const firstQmId = playerOrder[0];
    
    const newState: SyncedGameState = {
      ...createInitialSyncedState(),
      currentRoundIndex: 1,
      totalRounds,
      questionMasterId: firstQmId,
      roundPhase: "question-master-input",
      playerOrder,
      qmInputStartTime: Date.now(),
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [players, updateGameState]);

  // Start next round (advance to next QM)
  const startRound = useCallback(async () => {
    stopTimer();
    stopQmTimeout();
    
    const nextRoundIndex = gameState.currentRoundIndex + 1;
    
    if (nextRoundIndex > gameState.totalRounds) {
      // Game complete
      const newState: SyncedGameState = {
        ...gameState,
        roundPhase: "game-complete",
      };
      return await updateGameState(newState as unknown as Record<string, unknown>);
    }
    
    const nextQmId = getQuestionMasterIdForRound(nextRoundIndex);
    
    const newState: SyncedGameState = {
      ...gameState,
      currentRoundIndex: nextRoundIndex,
      questionMasterId: nextQmId,
      question: null,
      puzzleReady: false,
      currentHint: 0,
      unlockedHints: [true, false, false],
      timeRemaining: ROUND_DURATION,
      roundPhase: "question-master-input",
      playerAnswers: {},
      correctGuessOrder: [],
      roundStartTime: 0,
      qmInputStartTime: Date.now(),
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [gameState, getQuestionMasterIdForRound, stopTimer, stopQmTimeout, updateGameState]);

  // Skip to next QM (called on timeout or disconnect)
  const skipToNextQm = useCallback(async () => {
    stopQmTimeout();
    
    // Find next connected player in order
    let nextRoundIndex = gameState.currentRoundIndex;
    let attempts = 0;
    let nextQmId: string | null = null;
    
    while (attempts < gameState.totalRounds) {
      nextRoundIndex++;
      if (nextRoundIndex > gameState.totalRounds) {
        // All players tried, end game
        const newState: SyncedGameState = {
          ...gameState,
          roundPhase: "game-complete",
        };
        return await updateGameState(newState as unknown as Record<string, unknown>);
      }
      
      const potentialQmId = getQuestionMasterIdForRound(nextRoundIndex);
      const potentialQm = players.find(p => p.player_id === potentialQmId && p.is_connected);
      
      if (potentialQm) {
        nextQmId = potentialQmId;
        break;
      }
      attempts++;
    }
    
    if (!nextQmId) {
      // No connected players left
      const newState: SyncedGameState = {
        ...gameState,
        roundPhase: "game-complete",
      };
      return await updateGameState(newState as unknown as Record<string, unknown>);
    }
    
    const newState: SyncedGameState = {
      ...gameState,
      currentRoundIndex: nextRoundIndex,
      questionMasterId: nextQmId,
      question: null,
      puzzleReady: false,
      roundPhase: "question-master-input",
      qmInputStartTime: Date.now(),
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [gameState, getQuestionMasterIdForRound, players, stopQmTimeout, updateGameState]);

  // Question Master submits question
  const submitQuestion = useCallback(async (question: RoundQuestion) => {
    if (!isQuestionMaster()) return false;
    
    const newState: SyncedGameState = {
      ...gameState,
      question,
      puzzleReady: true,
      roundPhase: "guessing",
      timeRemaining: ROUND_DURATION,
      currentHint: 0,
      unlockedHints: [true, false, false],
      roundStartTime: Date.now(),
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [gameState, isQuestionMaster, updateGameState]);

  // Reveal next hint (QM only)
  const revealNextHint = useCallback(async () => {
    if (!isQuestionMaster()) return false;
    
    const nextHint = gameState.currentHint + 1;
    if (nextHint > 2) return false;
    
    const newUnlockedHints = [...gameState.unlockedHints];
    newUnlockedHints[nextHint] = true;
    
    const newState: SyncedGameState = {
      ...gameState,
      currentHint: nextHint,
      unlockedHints: newUnlockedHints,
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [gameState, isQuestionMaster, updateGameState]);

  // Player submits answer
  const submitAnswer = useCallback(async (playerId: string, answer: string) => {
    if (!gameState.question || gameState.roundPhase !== "guessing") return false;
    if (gameState.playerAnswers[playerId]) return false; // Already answered
    
    const isCorrect = fuzzyMatch(answer, gameState.question.answer);
    
    const newPlayerAnswers = {
      ...gameState.playerAnswers,
      [playerId]: { answer, isCorrect, answeredAt: Date.now() },
    };
    
    const newCorrectOrder = [...gameState.correctGuessOrder];
    if (isCorrect && !newCorrectOrder.includes(playerId)) {
      newCorrectOrder.push(playerId);
    }
    
    // Calculate points
    let points = 0;
    if (isCorrect) {
      const position = newCorrectOrder.indexOf(playerId);
      if (position === 0) points = POINTS_FIRST;
      else if (position === 1) points = POINTS_SECOND;
      else if (position === 2) points = POINTS_THIRD;
    }
    
    // Update player score in database
    if (points > 0) {
      const player = players.find(p => p.player_id === playerId);
      if (player) {
        await updatePlayerScore(playerId, player.score + points);
      }
    }
    
    const newState: SyncedGameState = {
      ...gameState,
      playerAnswers: newPlayerAnswers,
      correctGuessOrder: newCorrectOrder,
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [gameState, players, updateGameState, updatePlayerScore]);

  // End round
  const endRound = useCallback(async () => {
    stopTimer();
    
    if (gameState.roundPhase === "round-result" || gameState.roundPhase === "game-complete") {
      return false;
    }
    
    // If no one guessed correctly, QM gets bonus points
    if (gameState.correctGuessOrder.length === 0 && gameState.questionMasterId) {
      const qm = players.find(p => p.player_id === gameState.questionMasterId);
      if (qm) {
        await updatePlayerScore(gameState.questionMasterId, qm.score + POINTS_QM_NO_GUESS);
      }
    }
    
    const newState: SyncedGameState = {
      ...gameState,
      roundPhase: "round-result",
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [gameState, players, stopTimer, updateGameState, updatePlayerScore]);

  // Update timer in state (called by host periodically)
  const updateTimer = useCallback(async (newTime: number, newUnlockedHints: boolean[], newCurrentHint: number) => {
    const newState: SyncedGameState = {
      ...gameState,
      timeRemaining: newTime,
      unlockedHints: newUnlockedHints,
      currentHint: newCurrentHint,
    };
    
    return await updateGameState(newState as unknown as Record<string, unknown>);
  }, [gameState, updateGameState]);

  // Timer effect (host runs the timer)
  useEffect(() => {
    const isHost = players.find(p => p.player_id === currentPlayerId)?.is_host;
    
    if (gameState.roundPhase === "guessing" && isHost) {
      stopTimer();
      
      timerRef.current = setInterval(async () => {
        const elapsed = (Date.now() - gameState.roundStartTime) / 1000;
        const newTime = Math.max(0, ROUND_DURATION - Math.floor(elapsed));
        
        // Auto-unlock hints
        const newUnlockedHints = [...gameState.unlockedHints];
        let newCurrentHint = gameState.currentHint;
        
        if (elapsed >= HINT_2_AUTO_UNLOCK && !gameState.unlockedHints[1]) {
          newUnlockedHints[1] = true;
          newCurrentHint = Math.max(newCurrentHint, 1);
        }
        if (elapsed >= HINT_3_AUTO_UNLOCK && !gameState.unlockedHints[2]) {
          newUnlockedHints[2] = true;
          newCurrentHint = Math.max(newCurrentHint, 2);
        }
        
        // Check if all non-QM players answered
        const guessingPlayers = players.filter(p => p.player_id !== gameState.questionMasterId && p.is_connected);
        const allAnswered = guessingPlayers.every(p => gameState.playerAnswers[p.player_id]);
        
        if (newTime <= 0 || allAnswered) {
          stopTimer();
          await endRound();
        } else if (
          newTime !== gameState.timeRemaining ||
          JSON.stringify(newUnlockedHints) !== JSON.stringify(gameState.unlockedHints)
        ) {
          await updateTimer(newTime, newUnlockedHints, newCurrentHint);
        }
      }, 1000);
    }
    
    return () => stopTimer();
  }, [gameState.roundPhase, gameState.roundStartTime, currentPlayerId, players]);

  // QM timeout effect (host checks for disconnected/timed out QM)
  useEffect(() => {
    const isHost = players.find(p => p.player_id === currentPlayerId)?.is_host;
    
    if (gameState.roundPhase === "question-master-input" && isHost && gameState.qmInputStartTime) {
      stopQmTimeout();
      
      const checkQmStatus = async () => {
        const qm = players.find(p => p.player_id === gameState.questionMasterId);
        
        // Skip if QM disconnected
        if (qm && !qm.is_connected) {
          console.log("QM disconnected, skipping to next...");
          await skipToNextQm();
          return;
        }
        
        // Skip if QM timed out
        const elapsed = (Date.now() - gameState.qmInputStartTime) / 1000;
        if (elapsed >= QM_TIMEOUT) {
          console.log("QM timed out, skipping to next...");
          await skipToNextQm();
          return;
        }
      };
      
      // Check immediately
      checkQmStatus();
      
      // Set timeout for remaining time
      const elapsed = (Date.now() - gameState.qmInputStartTime) / 1000;
      const remaining = Math.max(0, (QM_TIMEOUT - elapsed) * 1000);
      
      if (remaining > 0) {
        qmTimeoutRef.current = setTimeout(() => {
          skipToNextQm();
        }, remaining);
      }
    }
    
    return () => stopQmTimeout();
  }, [gameState.roundPhase, gameState.questionMasterId, gameState.qmInputStartTime, currentPlayerId, players]);

  // Reset game
  const resetGame = useCallback(async () => {
    stopTimer();
    stopQmTimeout();
    
    // Reset all player scores
    for (const player of players) {
      await updatePlayerScore(player.player_id, 0);
    }
    
    return await updateGameState(createInitialSyncedState() as unknown as Record<string, unknown>);
  }, [players, stopTimer, stopQmTimeout, updateGameState, updatePlayerScore]);

  // Get winners
  const getWinners = useCallback((): MultiplayerPlayer[] => {
    if (gamePlayers.length === 0) return [];
    const maxScore = Math.max(...gamePlayers.map(p => p.score), 0);
    return gamePlayers.filter(p => p.score === maxScore);
  }, [gamePlayers]);

  // Get leaderboard
  const getLeaderboard = useCallback((): MultiplayerPlayer[] => {
    return [...gamePlayers].sort((a, b) => b.score - a.score);
  }, [gamePlayers]);

  return {
    // State from database
    players: gamePlayers,
    currentRound: gameState.currentRoundIndex,
    totalRounds: gameState.totalRounds,
    questionMasterId: gameState.questionMasterId,
    question: gameState.question,
    puzzleReady: gameState.puzzleReady,
    currentHint: gameState.currentHint,
    unlockedHints: gameState.unlockedHints,
    timeRemaining: gameState.timeRemaining,
    roundPhase: gameState.roundPhase,
    correctGuessOrder: gameState.correctGuessOrder,
    
    // Actions
    initializeGame,
    startRound,
    submitQuestion,
    revealNextHint,
    submitAnswer,
    endRound,
    resetGame,
    skipToNextQm,
    
    // Helpers
    getCurrentPlayer,
    isQuestionMaster,
    getQuestionMaster,
    getWinners,
    getLeaderboard,
    
    // Constants
    ROUND_DURATION,
    QM_TIMEOUT,
  };
};
