import { useState, useCallback, useRef, useEffect } from "react";
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
  unlockedHints: boolean[];
  maxPoints: number;
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
  roundStartTime: number;
}

const POINTS_PER_HINT = [10, 7, 5];
const ROUND_DURATION = 30;
const TOTAL_ROUNDS = 10;

// Category datasets mapping with fallback empty arrays
const categoryDatasets: Record<Category, string[]> = {
  movies: bollywoodMovies || [],
  animals: animals || [],
  places: indianPlaces || [],
  things: things || [],
};

// Ensure datasets are valid
const getDataset = (category: Category): string[] => {
  const dataset = categoryDatasets[category];
  return Array.isArray(dataset) && dataset.length > 0 ? dataset : [];
};

// Hint templates for each category - indirect and descriptive
const movieHints: Record<string, string[]> = {
  default: [
    "A story of love and sacrifice that touched millions",
    "Features memorable songs and dramatic moments",
    "A tale that explores family bonds and emotions",
  ],
};

const animalHints: Record<string, string[]> = {
  Dog: [
    "Often called man's best friend",
    "A loyal domestic companion that loves to fetch",
  ],
  Cat: [
    "Known for its independence and graceful movements",
    "A purring pet that loves to chase mice",
  ],
  Lion: [
    "Called the king of the jungle",
    "A majestic big cat with a mighty roar",
  ],
  Elephant: [
    "The largest land animal on Earth",
    "Known for its long trunk and excellent memory",
  ],
  Tiger: [
    "A fierce striped predator of the jungle",
    "India's national animal, powerful and solitary",
  ],
  default: [
    "A creature found in nature",
    "Lives and breathes like all living beings",
  ],
};

const placeHints: Record<string, string[]> = {
  Mumbai: [
    "The financial capital and home of Bollywood",
    "A coastal city known for its fast-paced life",
  ],
  Delhi: [
    "India's capital with rich Mughal history",
    "Home to the Red Fort and India Gate",
  ],
  Jaipur: [
    "Known as the Pink City of Rajasthan",
    "Famous for its royal palaces and forts",
  ],
  default: [
    "A place of cultural and historical significance",
    "Known for its unique heritage and landmarks",
  ],
};

const thingHints: Record<string, string[]> = {
  Phone: [
    "A device that keeps you connected worldwide",
    "You use it to call, text, and browse",
  ],
  Chair: [
    "A piece of furniture for sitting",
    "Found in homes, offices, and schools",
  ],
  Book: [
    "A source of knowledge and stories",
    "Made of pages bound together",
  ],
  default: [
    "An object used in daily life",
    "Something you might find around you",
  ],
};

// Generate hints based on category and answer
const generateHints = (answer: string, category: Category): string[] => {
  if (!answer || !category) {
    return ["Think about this one", "Consider the category", "3 letters, starts with ?"];
  }
  
  const hints: string[] = [];
  const answerLength = answer.replace(/\s/g, "").length;
  const firstLetter = answer[0]?.toUpperCase() || "?";
  
  // Get category-specific hints or use defaults
  const getHintTemplates = (cat: Category, ans: string): string[] => {
    switch (cat) {
      case "movies":
        return movieHints[ans] || movieHints.default;
      case "animals":
        return animalHints[ans] || animalHints.default;
      case "places":
        return placeHints[ans] || placeHints.default;
      case "things":
        return thingHints[ans] || thingHints.default;
      default:
        return ["Think carefully about this one", "A tricky puzzle awaits"];
    }
  };

  const templates = getHintTemplates(category, answer);
  
  // Hint 1: Indirect descriptive hint (no letters, no length)
  hints.push(templates[0] || `A ${category.slice(0, -1)} that is quite well-known`);
  
  // Hint 2: Functional/contextual clue (still no letters)
  hints.push(templates[1] || templates[0] || `Think about popular ${category}`);
  
  // Hint 3: Word length + starting letter together
  const wordCount = answer.split(" ").length;
  if (wordCount > 1) {
    hints.push(`${answerLength} letters total across ${wordCount} words, starts with "${firstLetter}"`);
  } else {
    hints.push(`${answerLength} letters, starts with "${firstLetter}"`);
  }
  
  return hints;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  if (!Array.isArray(array) || array.length === 0) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate smart options - similar length, same category, confusing alternatives
const generateOptions = (correctAnswer: string, category: Category, usedAnswers: Set<string>): string[] => {
  const dataset = getDataset(category);
  
  if (!correctAnswer || dataset.length === 0) {
    return [correctAnswer || "Option 1", "Option 2", "Option 3", "Option 4"];
  }
  
  const correctLength = correctAnswer.replace(/\s/g, "").length;
  const firstLetter = correctAnswer[0]?.toLowerCase() || "";
  
  // Get wrong options from dataset, excluding the correct answer and used answers
  const availableWrongAnswers = dataset.filter(
    (ans) => ans && ans !== correctAnswer && !usedAnswers.has(ans)
  );
  
  if (availableWrongAnswers.length < 3) {
    // Not enough options, use what we have
    const allOptions = [correctAnswer, ...availableWrongAnswers.slice(0, 3)];
    while (allOptions.length < 4) {
      allOptions.push(`Option ${allOptions.length + 1}`);
    }
    return shuffleArray(allOptions);
  }
  
  // Score each option by similarity to correct answer
  const scoredOptions = availableWrongAnswers.map((option) => {
    const optionLength = option.replace(/\s/g, "").length;
    const lengthDiff = Math.abs(optionLength - correctLength);
    const sameFirstLetter = option[0]?.toLowerCase() === firstLetter ? 1 : 0;
    const sameWordCount = option.split(" ").length === correctAnswer.split(" ").length ? 1 : 0;
    
    // Higher score = more similar (better distractor)
    let score = 0;
    if (lengthDiff <= 2) score += 3;
    else if (lengthDiff <= 4) score += 1;
    score += sameFirstLetter * 2;
    score += sameWordCount * 1;
    
    return { option, score, lengthDiff };
  });
  
  // Sort by score (desc) then by length difference (asc) for tiebreaker
  scoredOptions.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.lengthDiff - b.lengthDiff;
  });
  
  // Take top candidates and shuffle to add randomness
  const topCandidates = scoredOptions.slice(0, 10);
  const shuffledTop = shuffleArray(topCandidates);
  const selectedWrong = shuffledTop.slice(0, 3).map((s) => s.option);
  
  // Combine correct + wrong and shuffle
  return shuffleArray([correctAnswer, ...selectedWrong]);
};

const getRandomAnswer = (category: Category, usedAnswers: Set<string>): string | null => {
  const dataset = getDataset(category);
  
  if (dataset.length === 0) return null;
  
  const available = dataset.filter((item) => item && !usedAnswers.has(item));
  
  if (available.length === 0) {
    return null;
  }
  
  return available[Math.floor(Math.random() * available.length)];
};

const createInitialState = (): GameState => ({
  category: null,
  currentHint: 0,
  unlockedHints: [true, false, false],
  maxPoints: POINTS_PER_HINT[0],
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
  roundStartTime: 0,
});

export const useGame = () => {
  const usedAnswersRef = useRef<Set<string>>(new Set());
  
  const [state, setState] = useState<GameState>(createInitialState());

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
    
    // Reset if all answers used
    if (!answer) {
      usedAnswersRef.current = new Set();
      answer = getRandomAnswer(category, usedAnswersRef.current);
    }
    
    if (!answer) {
      console.error("No answers available for category:", category);
      return;
    }
    
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
      unlockedHints: [true, false, false],
      maxPoints: POINTS_PER_HINT[0],
      isPlaying: true,
      round: currentRound + 1,
      result: null,
      selectedAnswer: null,
      showResult: false,
      roundStartTime: Date.now(),
    }));
  }, []);

  const startGameWithRound = useCallback(() => {
    if (!state.category) return;
    
    // Reset used answers for new game
    usedAnswersRef.current = new Set();
    
    const answer = getRandomAnswer(state.category, usedAnswersRef.current);
    if (!answer) {
      console.error("No answers available for category:", state.category);
      return;
    }
    
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
      unlockedHints: [true, false, false],
      maxPoints: POINTS_PER_HINT[0],
      isPlaying: true,
      result: null,
      selectedAnswer: null,
      showResult: false,
      roundStartTime: Date.now(),
    }));
  }, [state.category]);

  const unlockHint = useCallback((hintIndex: number) => {
    setState((prev) => {
      if (hintIndex < 0 || hintIndex > 2) return prev;
      if (prev.unlockedHints[hintIndex] || hintIndex === 0) return prev;
      
      const newUnlockedHints = [...prev.unlockedHints];
      newUnlockedHints[hintIndex] = true;
      
      // Update max points to the newly unlocked hint's points
      const newMaxPoints = POINTS_PER_HINT[hintIndex];
      
      return {
        ...prev,
        unlockedHints: newUnlockedHints,
        currentHint: hintIndex,
        maxPoints: newMaxPoints,
      };
    });
  }, []);

  // Auto-unlock hints based on time elapsed (60s for hint 2, 120s for hint 3)
  const checkAutoUnlock = useCallback(() => {
    if (!state.isPlaying || state.showResult) return;
    
    const elapsed = (Date.now() - state.roundStartTime) / 1000;
    
    if (elapsed >= 60 && !state.unlockedHints[1]) {
      unlockHint(1);
    }
    if (elapsed >= 120 && !state.unlockedHints[2]) {
      unlockHint(2);
    }
  }, [state.isPlaying, state.showResult, state.roundStartTime, state.unlockedHints, unlockHint]);

  const submitAnswer = useCallback((answer: string) => {
    if (!state.question || state.showResult) return false;

    const isCorrect = answer === state.question.answer;

    setState((prev) => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
      result: isCorrect ? "correct" : "wrong",
      score: isCorrect ? prev.score + prev.maxPoints : prev.score,
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
    setState(createInitialState());
  }, []);

  const playAgain = useCallback(() => {
    usedAnswersRef.current = new Set();
    setState((prev) => ({
      ...prev,
      currentHint: 0,
      unlockedHints: [true, false, false],
      maxPoints: POINTS_PER_HINT[0],
      score: 0,
      round: 0,
      correctAnswers: 0,
      isPlaying: false,
      isGameComplete: false,
      question: null,
      result: null,
      selectedAnswer: null,
      showResult: false,
      roundStartTime: 0,
    }));
  }, []);

  return {
    ...state,
    selectCategory,
    startGame: startGameWithRound,
    unlockHint,
    checkAutoUnlock,
    submitAnswer,
    nextRound,
    endRound,
    resetGame,
    playAgain,
    roundDuration: ROUND_DURATION,
    totalRounds: TOTAL_ROUNDS,
  };
};