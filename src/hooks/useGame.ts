import { useState, useCallback } from "react";
import { Category } from "@/components/CategoryCard";

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
  usedAnswers: Set<string>;
  result: "correct" | "wrong" | null;
  selectedAnswer: string | null;
  showResult: boolean;
}

const POINTS_PER_HINT = [10, 7, 5];
const ROUND_DURATION = 30;
const TOTAL_ROUNDS = 10;

// Expanded mock data with wrong options pool per category
const questionBank: Record<Category, { answer: string; hints: string[] }[]> = {
  movies: [
    { answer: "Titanic", hints: ["An ocean voyage that ends in tragedy", "Leonardo DiCaprio and Kate Winslet star in this epic", "The ship sinks after hitting an iceberg"] },
    { answer: "The Dark Knight", hints: ["A superhero protects a city", "Heath Ledger won an Oscar for this film", "Why so serious?"] },
    { answer: "Inception", hints: ["Dreams within dreams", "A spinning top that may or may not fall", "Christopher Nolan directs Leonardo DiCaprio"] },
    { answer: "Avatar", hints: ["Blue aliens on a distant moon", "James Cameron's sci-fi epic", "Pandora is the setting"] },
    { answer: "Jurassic Park", hints: ["Scientists bring something back from extinction", "Life finds a way", "Steven Spielberg's dinosaur adventure"] },
    { answer: "The Matrix", hints: ["Red pill or blue pill?", "Keanu Reeves dodges bullets", "We live in a simulation"] },
    { answer: "Forrest Gump", hints: ["Life is like a box of chocolates", "A man runs across America", "Tom Hanks plays a simple man with a big heart"] },
    { answer: "The Lion King", hints: ["A cub loses his father", "Hakuna Matata", "Circle of life in the African savanna"] },
    { answer: "Gladiator", hints: ["A Roman general seeks revenge", "Are you not entertained?", "Russell Crowe fights in the Colosseum"] },
    { answer: "The Godfather", hints: ["A powerful family business", "An offer you can't refuse", "Marlon Brando's iconic role"] },
    { answer: "Interstellar", hints: ["Space exploration to save humanity", "Time moves differently near a black hole", "Christopher Nolan's cosmic journey"] },
    { answer: "Fight Club", hints: ["First rule: don't talk about it", "Brad Pitt and Edward Norton", "A twist ending about identity"] },
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
    { answer: "Koala", hints: ["Sleeps up to 22 hours a day", "Eats eucalyptus leaves", "Native to Australia with a teddy bear look"] },
    { answer: "Flamingo", hints: ["Known for standing on one leg", "Pink color comes from their diet", "Lives in shallow waters"] },
    { answer: "Panda", hints: ["Black and white bear", "Loves to eat bamboo", "Native to China and symbol of conservation"] },
    { answer: "Cheetah", hints: ["Fastest land animal", "Has black tear marks on face", "Spotted coat for camouflage"] },
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
    { answer: "Rome", hints: ["Ancient empire's capital", "Has a famous Colosseum", "All roads lead here"] },
    { answer: "London", hints: ["Home of Big Ben", "The Thames runs through it", "Royal family lives here"] },
    { answer: "Rio de Janeiro", hints: ["Famous for Carnival", "Christ the Redeemer statue", "Copacabana beach"] },
    { answer: "Amsterdam", hints: ["City of bicycles and canals", "Famous for tulips", "Capital of the Netherlands"] },
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
    { answer: "Typewriter", hints: ["Predecessor to keyboards", "Makes clicking sounds", "Used before computers"] },
    { answer: "Gramophone", hints: ["Plays vinyl records", "Has a large horn speaker", "Vintage music player"] },
    { answer: "Parachute", hints: ["Slows your fall", "Opens in the sky", "Used by skydivers"] },
    { answer: "Microscope", hints: ["Makes tiny things visible", "Used in laboratories", "Has multiple lenses"] },
  ],
};

// Pool of wrong answers per category for generating MCQ options
const wrongAnswersPool: Record<Category, string[]> = {
  movies: [
    "Shrek", "Finding Nemo", "Star Wars", "Frozen", "Spider-Man", "Iron Man", "The Avengers",
    "Harry Potter", "Lord of the Rings", "Back to the Future", "E.T.", "Jaws", "Rocky",
    "Terminator", "Die Hard", "Mission Impossible", "Indiana Jones", "Pirates of the Caribbean"
  ],
  animals: [
    "Lion", "Tiger", "Bear", "Wolf", "Eagle", "Shark", "Whale", "Crocodile", "Monkey",
    "Zebra", "Hippopotamus", "Rhinoceros", "Gorilla", "Leopard", "Snake", "Parrot",
    "Owl", "Seal", "Polar Bear", "Deer"
  ],
  places: [
    "Berlin", "Madrid", "Barcelona", "Moscow", "Beijing", "Bangkok", "Singapore", "Mumbai",
    "Istanbul", "Athens", "Vienna", "Prague", "Budapest", "Dublin", "Edinburgh",
    "San Francisco", "Las Vegas", "Miami", "Los Angeles", "Chicago"
  ],
  things: [
    "Clock", "Mirror", "Candle", "Book", "Camera", "Guitar", "Violin", "Drum",
    "Binoculars", "Thermometer", "Kaleidoscope", "Phonograph", "Sextant", "Pendulum",
    "Metronome", "Barometer", "Sundial", "Periscope", "Stethoscope", "Magnifying Glass"
  ],
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
  // Get wrong options from pool, excluding the correct answer and used answers
  const availableWrongAnswers = wrongAnswersPool[category].filter(
    (ans) => ans !== correctAnswer && !usedAnswers.has(ans)
  );
  
  // Also add other question answers as potential wrong options
  const otherQuestionAnswers = questionBank[category]
    .map((q) => q.answer)
    .filter((ans) => ans !== correctAnswer && !usedAnswers.has(ans));
  
  const allWrongOptions = [...new Set([...availableWrongAnswers, ...otherQuestionAnswers])];
  const shuffledWrong = shuffleArray(allWrongOptions);
  const selectedWrong = shuffledWrong.slice(0, 3);
  
  // Combine correct + wrong and shuffle
  return shuffleArray([correctAnswer, ...selectedWrong]);
};

export const useGame = () => {
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
    usedAnswers: new Set(),
    result: null,
    selectedAnswer: null,
    showResult: false,
  });

  const selectCategory = useCallback((category: Category) => {
    setState((prev) => ({ ...prev, category }));
  }, []);

  const startRound = useCallback(() => {
    if (!state.category) return;

    // Check if game is complete
    if (state.round >= TOTAL_ROUNDS) {
      setState((prev) => ({
        ...prev,
        isGameComplete: true,
        isPlaying: false,
      }));
      return;
    }

    let availableQuestions = questionBank[state.category].filter(
      (q) => !state.usedAnswers.has(q.answer)
    );

    // Reset if all questions used
    let newUsedAnswers = state.usedAnswers;
    if (availableQuestions.length === 0) {
      newUsedAnswers = new Set();
      availableQuestions = questionBank[state.category];
    }

    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    const options = generateOptions(randomQuestion.answer, state.category, newUsedAnswers);

    setState((prev) => ({
      ...prev,
      question: {
        ...randomQuestion,
        options,
      },
      currentHint: 0,
      isPlaying: true,
      round: prev.round + 1,
      result: null,
      selectedAnswer: null,
      showResult: false,
      usedAnswers: new Set([...newUsedAnswers, randomQuestion.answer]),
    }));
  }, [state.category, state.usedAnswers, state.round]);

  const startGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      score: 0,
      round: 0,
      correctAnswers: 0,
      isGameComplete: false,
      usedAnswers: new Set(),
    }));
    // Use setTimeout to ensure state is updated before starting round
    setTimeout(() => {
      startRound();
    }, 0);
  }, []);

  // Need to call startRound after state reset
  const startGameWithRound = useCallback(() => {
    if (!state.category) return;
    
    const availableQuestions = questionBank[state.category];
    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    const options = generateOptions(randomQuestion.answer, state.category, new Set());

    setState((prev) => ({
      ...prev,
      score: 0,
      round: 1,
      correctAnswers: 0,
      isGameComplete: false,
      usedAnswers: new Set([randomQuestion.answer]),
      question: {
        ...randomQuestion,
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

    // Auto advance to next round after showing result
    setTimeout(() => {
      setState((prev) => {
        if (prev.round >= TOTAL_ROUNDS) {
          return {
            ...prev,
            isGameComplete: true,
            isPlaying: false,
          };
        }
        return prev;
      });
    }, 1500);

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
    startRound();
  }, [state.round, startRound]);

  const endRound = useCallback(() => {
    // Time's up - show result with no selection
    setState((prev) => ({
      ...prev,
      showResult: true,
      result: "wrong",
    }));

    setTimeout(() => {
      if (state.round >= TOTAL_ROUNDS) {
        setState((prev) => ({
          ...prev,
          isGameComplete: true,
          isPlaying: false,
        }));
      }
    }, 1500);
  }, [state.round]);

  const resetGame = useCallback(() => {
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
      usedAnswers: new Set(),
      result: null,
      selectedAnswer: null,
      showResult: false,
    });
  }, []);

  const playAgain = useCallback(() => {
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
      usedAnswers: new Set(),
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
