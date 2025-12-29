import { useState, useCallback, useRef } from "react";
import { Category } from "@/components/CategoryCard";
import { bollywoodMovies } from "@/data/bollywoodMovies";
import { animals } from "@/data/animals";
import { indianPlaces } from "@/data/indianPlaces";
import { things } from "@/data/things";

interface GameQuestion {
  answer: string;
  hints: string[];
  options: string[];
}

interface GameState {
  category: Category | null;
  currentHint: number;
  score: number;
  round: number;
  totalRounds: number;
  correctAnswers: number;
  isPlaying: boolean;
  isGameComplete: boolean;
  question: GameQuestion | null;
  result: "correct" | "wrong" | null;
  selectedAnswer: string | null;
  showResult: boolean;
}

const POINTS_PER_HINT = [10, 7, 5];
const ROUND_DURATION = 30;
const TOTAL_ROUNDS = 10;

// Category datasets mapping
const categoryDatasets: Record<Category, string[]> = {
  movies: bollywoodMovies,
  animals: animals,
  places: indianPlaces,
  things: things,
};

// Generate hints based on category and answer
const generateHints = (answer: string, category: Category): string[] => {
  const hints: string[] = [];
  
  switch (category) {
    case "movies":
      hints.push(`This is a Bollywood movie with ${answer.split(" ").length} word(s)`);
      hints.push(`The movie starts with the letter "${answer[0]}"`);
      hints.push(`The movie name is: ${answer.substring(0, Math.ceil(answer.length / 2))}...`);
      break;
    case "animals":
      hints.push(`This animal name has ${answer.length} letters`);
      hints.push(`It starts with the letter "${answer[0]}"`);
      hints.push(`The name begins with: ${answer.substring(0, Math.ceil(answer.length / 2))}...`);
      break;
    case "places":
      hints.push(`This Indian place has ${answer.split(" ").length} word(s) in its name`);
      hints.push(`It starts with the letter "${answer[0]}"`);
      hints.push(`The name is: ${answer.substring(0, Math.ceil(answer.length / 2))}...`);
      break;
    case "things":
      hints.push(`This thing has ${answer.length} letters in its name`);
      hints.push(`It starts with the letter "${answer[0]}"`);
      hints.push(`The name begins with: ${answer.substring(0, Math.ceil(answer.length / 2))}...`);
      break;
  }
  
  return hints;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateOptions = (correctAnswer: string, category: Category, usedAnswers: Set<string>): string[] => {
  const dataset = categoryDatasets[category];
  
  // Get wrong options from dataset, excluding the correct answer and used answers
  const availableWrongAnswers = dataset.filter(
    (ans) => ans !== correctAnswer && !usedAnswers.has(ans)
  );
  
  const shuffledWrong = shuffleArray(availableWrongAnswers);
  const selectedWrong = shuffledWrong.slice(0, 3);
  
  // Combine correct + wrong and shuffle
  return shuffleArray([correctAnswer, ...selectedWrong]);
};

const getRandomAnswer = (category: Category, usedAnswers: Set<string>): string | null => {
  const dataset = categoryDatasets[category];
  const available = dataset.filter((item) => !usedAnswers.has(item));
  
  if (available.length === 0) {
    return null;
  }
  
  return available[Math.floor(Math.random() * available.length)];
};

export const useGame = () => {
  const usedAnswersRef = useRef<Set<string>>(new Set());
  
  const [state, setState] = useState<GameState>({
    category: null,
    currentHint: 0,
    score: 0,
    round: 0,
    totalRounds: TOTAL_ROUNDS,
    correctAnswers: 0,
    isPlaying: false,
    isGameComplete: false,
    question: null,
    result: null,
    selectedAnswer: null,
    showResult: false,
  });

  const selectCategory = useCallback((category: Category) => {
    setState((prev) => ({ ...prev, category }));
  }, []);

  const startRound = useCallback((category: Category, currentRound: number) => {
    // Check if game is complete
    if (currentRound >= TOTAL_ROUNDS) {
      setState((prev) => ({
        ...prev,
        isGameComplete: true,
        isPlaying: false,
      }));
      return;
    }

    // Get random answer that hasn't been used
    let answer = getRandomAnswer(category, usedAnswersRef.current);
    
    // Reset if all answers used (shouldn't happen with large datasets)
    if (!answer) {
      usedAnswersRef.current = new Set();
      answer = getRandomAnswer(category, usedAnswersRef.current);
    }
    
    if (!answer) return;
    
    // Mark answer as used
    usedAnswersRef.current.add(answer);
    
    const hints = generateHints(answer, category);
    const options = generateOptions(answer, category, usedAnswersRef.current);

    setState((prev) => ({
      ...prev,
      question: {
        answer,
        hints,
        options,
      },
      currentHint: 0,
      isPlaying: true,
      round: currentRound + 1,
      result: null,
      selectedAnswer: null,
      showResult: false,
    }));
  }, []);

  const startGameWithRound = useCallback(() => {
    if (!state.category) return;
    
    // Reset used answers for new game
    usedAnswersRef.current = new Set();
    
    const answer = getRandomAnswer(state.category, usedAnswersRef.current);
    if (!answer) return;
    
    usedAnswersRef.current.add(answer);
    
    const hints = generateHints(answer, state.category);
    const options = generateOptions(answer, state.category, usedAnswersRef.current);

    setState((prev) => ({
      ...prev,
      score: 0,
      round: 1,
      correctAnswers: 0,
      isGameComplete: false,
      question: {
        answer,
        hints,
        options,
      },
      currentHint: 0,
      isPlaying: true,
      result: null,
      selectedAnswer: null,
      showResult: false,
    }));
  }, [state.category]);

  const nextHint = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentHint: Math.min(prev.currentHint + 1, 2),
    }));
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    if (!state.question || state.showResult) return false;

    const isCorrect = answer === state.question.answer;

    setState((prev) => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
      result: isCorrect ? "correct" : "wrong",
      score: isCorrect ? prev.score + POINTS_PER_HINT[prev.currentHint] : prev.score,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));

    return isCorrect;
  }, [state.question, state.showResult]);

  const nextRound = useCallback(() => {
    if (state.round >= TOTAL_ROUNDS) {
      setState((prev) => ({
        ...prev,
        isGameComplete: true,
        isPlaying: false,
      }));
      return;
    }
    if (state.category) {
      startRound(state.category, state.round);
    }
  }, [state.round, state.category, startRound]);

  const endRound = useCallback(() => {
    // Time's up - show result with no selection
    setState((prev) => ({
      ...prev,
      showResult: true,
      result: "wrong",
    }));
  }, []);

  const resetGame = useCallback(() => {
    usedAnswersRef.current = new Set();
    setState({
      category: null,
      currentHint: 0,
      score: 0,
      round: 0,
      totalRounds: TOTAL_ROUNDS,
      correctAnswers: 0,
      isPlaying: false,
      isGameComplete: false,
      question: null,
      result: null,
      selectedAnswer: null,
      showResult: false,
    });
  }, []);

  const playAgain = useCallback(() => {
    usedAnswersRef.current = new Set();
    setState((prev) => ({
      ...prev,
      currentHint: 0,
      score: 0,
      round: 0,
      correctAnswers: 0,
      isPlaying: false,
      isGameComplete: false,
      question: null,
      result: null,
      selectedAnswer: null,
      showResult: false,
    }));
  }, []);

  return {
    ...state,
    selectCategory,
    startGame: startGameWithRound,
    nextHint,
    submitAnswer,
    nextRound,
    endRound,
    resetGame,
    playAgain,
    roundDuration: ROUND_DURATION,
    totalRounds: TOTAL_ROUNDS,
  };
};
