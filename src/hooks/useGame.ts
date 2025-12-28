import { useState, useCallback } from "react";
import { Category } from "@/components/CategoryCard";

interface GameQuestion {
  answer: string;
  hints: string[];
}

interface GameState {
  category: Category | null;
  currentHint: number;
  score: number;
  round: number;
  isPlaying: boolean;
  question: GameQuestion | null;
  usedAnswers: Set<string>;
  result: "correct" | "wrong" | null;
}

const POINTS_PER_HINT = [10, 7, 5];
const ROUND_DURATION = 60;

// Expanded mock data - in production, this would come from AI
const questionBank: Record<Category, GameQuestion[]> = {
  movies: [
    { answer: "Titanic", hints: ["An ocean voyage that ends in tragedy", "Leonardo DiCaprio and Kate Winslet star in this epic", "The ship sinks after hitting an iceberg"] },
    { answer: "The Dark Knight", hints: ["A superhero protects a city", "Heath Ledger won an Oscar for this film", "Why so serious?"] },
    { answer: "Inception", hints: ["Dreams within dreams", "A spinning top that may or may not fall", "Christopher Nolan directs Leonardo DiCaprio"] },
    { answer: "Avatar", hints: ["Blue aliens on a distant moon", "James Cameron's sci-fi epic", "Pandora is the setting"] },
    { answer: "Jurassic Park", hints: ["Scientists bring something back from extinction", "Life finds a way", "Steven Spielberg's dinosaur adventure"] },
    { answer: "The Matrix", hints: ["Red pill or blue pill?", "Keanu Reeves dodges bullets", "We live in a simulation"] },
    { answer: "Forrest Gump", hints: ["Life is like a box of chocolates", "A man runs across America", "Tom Hanks plays a simple man with a big heart"] },
    { answer: "The Lion King", hints: ["A cub loses his father", "Hakuna Matata", "Circle of life in the African savanna"] },
  ],
  animals: [
    { answer: "Elephant", hints: ["Largest land animal", "Has a long trunk for drinking and grabbing things", "Known for their excellent memory"] },
    { answer: "Penguin", hints: ["A bird that cannot fly", "Lives in cold climates and waddles", "Black and white tuxedo appearance"] },
    { answer: "Chameleon", hints: ["A reptile known for camouflage", "Eyes that move independently", "Changes color based on mood"] },
    { answer: "Dolphin", hints: ["A marine mammal known for intelligence", "Uses echolocation to find food", "Loves to swim alongside boats"] },
    { answer: "Kangaroo", hints: ["Native to Australia", "Carries babies in a pouch", "Hops on powerful hind legs"] },
    { answer: "Octopus", hints: ["Has eight arms", "Can change color and texture", "Lives in the ocean and is very intelligent"] },
    { answer: "Peacock", hints: ["Known for colorful tail feathers", "The males display to attract mates", "Native to South Asia"] },
    { answer: "Giraffe", hints: ["Has the longest neck of any animal", "Native to African savannas", "Has a spotted pattern like no other"] },
  ],
  places: [
    { answer: "Paris", hints: ["The City of Light", "Home to a famous iron tower", "Known for romance and croissants"] },
    { answer: "Tokyo", hints: ["A blend of ultramodern and traditional", "Capital of an island nation", "Famous for cherry blossoms and sushi"] },
    { answer: "New York City", hints: ["The Big Apple", "Has a famous green statue", "Never sleeps with Times Square"] },
    { answer: "Cairo", hints: ["Ancient pyramids nearby", "Capital of a North African country", "The Nile River flows through"] },
    { answer: "Sydney", hints: ["Famous for an opera house", "Largest city in Australia", "Has a stunning harbour bridge"] },
    { answer: "Venice", hints: ["City of canals", "Built on water in Italy", "Gondolas are the main transport"] },
    { answer: "Machu Picchu", hints: ["Ancient Incan citadel", "High in the Andes mountains", "Located in Peru"] },
    { answer: "Dubai", hints: ["Has the world's tallest building", "A desert transformed into luxury", "Famous for artificial islands"] },
  ],
  things: [
    { answer: "Umbrella", hints: ["Protects you from weather", "Opens and closes with a button", "Has a curved handle"] },
    { answer: "Piano", hints: ["A musical instrument with keys", "Can be grand or upright", "Has 88 black and white keys"] },
    { answer: "Telescope", hints: ["Used to see distant objects", "Astronomers use this to study stars", "Galileo made this famous"] },
    { answer: "Bicycle", hints: ["Two wheels for transportation", "Powered by pedaling", "Eco-friendly way to travel"] },
    { answer: "Lighthouse", hints: ["Guides ships safely", "Stands tall on coastlines", "Has a rotating bright light"] },
    { answer: "Compass", hints: ["Points to magnetic north", "Helps with navigation", "Essential for explorers"] },
    { answer: "Hourglass", hints: ["Measures time with falling grains", "Has two glass bulbs", "Flip it to restart"] },
    { answer: "Chandelier", hints: ["Hangs from the ceiling", "Contains many lights", "Often made of crystal"] },
  ],
};

export const useGame = () => {
  const [state, setState] = useState<GameState>({
    category: null,
    currentHint: 0,
    score: 0,
    round: 0,
    isPlaying: false,
    question: null,
    usedAnswers: new Set(),
    result: null,
  });

  const selectCategory = useCallback((category: Category) => {
    setState((prev) => ({ ...prev, category }));
  }, []);

  const startGame = useCallback(() => {
    if (!state.category) return;

    const availableQuestions = questionBank[state.category].filter(
      (q) => !state.usedAnswers.has(q.answer)
    );

    if (availableQuestions.length === 0) {
      // Reset used answers if all have been used
      setState((prev) => ({
        ...prev,
        usedAnswers: new Set(),
      }));
      return;
    }

    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    setState((prev) => ({
      ...prev,
      question: randomQuestion,
      currentHint: 0,
      isPlaying: true,
      round: prev.round + 1,
      result: null,
      usedAnswers: new Set([...prev.usedAnswers, randomQuestion.answer]),
    }));
  }, [state.category, state.usedAnswers]);

  const nextHint = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentHint: Math.min(prev.currentHint + 1, 2),
    }));
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    if (!state.question) return false;

    const isCorrect =
      answer.toLowerCase().trim() ===
      state.question.answer.toLowerCase().trim();

    if (isCorrect) {
      const points = POINTS_PER_HINT[state.currentHint] || 5;
      setState((prev) => ({
        ...prev,
        score: prev.score + points,
        result: "correct",
        isPlaying: false,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        result: "wrong",
      }));
      // Clear wrong result after animation
      setTimeout(() => {
        setState((prev) => ({ ...prev, result: null }));
      }, 1000);
    }

    return isCorrect;
  }, [state.question, state.currentHint]);

  const endRound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      category: null,
      currentHint: 0,
      score: 0,
      round: 0,
      isPlaying: false,
      question: null,
      usedAnswers: new Set(),
      result: null,
    });
  }, []);

  const playAgain = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentHint: 0,
      isPlaying: false,
      question: null,
      result: null,
    }));
  }, []);

  return {
    ...state,
    selectCategory,
    startGame,
    nextHint,
    submitAnswer,
    endRound,
    resetGame,
    playAgain,
    roundDuration: ROUND_DURATION,
  };
};
