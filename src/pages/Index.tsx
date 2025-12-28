import { useState } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { CategorySelect } from "@/components/CategorySelect";
import { GameScreen } from "@/components/GameScreen";
import { MultiplayerLobby } from "@/components/MultiplayerLobby";
import { useGame } from "@/hooks/useGame";
import { Helmet } from "react-helmet";

type GameMode = "home" | "category" | "playing" | "multiplayer";

const Index = () => {
  const [mode, setMode] = useState<GameMode>("home");
  const game = useGame();

  const handleSinglePlayer = () => {
    setMode("category");
  };

  const handleMultiplayer = () => {
    setMode("multiplayer");
  };

  const handleStartGame = () => {
    game.startGame();
    setMode("playing");
  };

  const handlePlayAgain = () => {
    game.playAgain();
    game.startGame();
  };

  const handleHome = () => {
    game.resetGame();
    setMode("home");
  };

  const handleBackToCategory = () => {
    setMode("category");
  };

  return (
    <>
      <Helmet>
        <title>Dumb Charades - Guess the Word Game</title>
        <meta
          name="description"
          content="Play Dumb Charades online! Guess words from hints in single player or multiplayer mode. Fun party game with movies, animals, places, and things categories."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0f1c" />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>

      {mode === "home" && (
        <HomeScreen
          onSinglePlayer={handleSinglePlayer}
          onMultiplayer={handleMultiplayer}
        />
      )}

      {mode === "category" && (
        <CategorySelect
          selectedCategory={game.category}
          onSelectCategory={game.selectCategory}
          onStartGame={handleStartGame}
          onBack={handleHome}
        />
      )}

      {mode === "playing" && game.question && game.category && (
        <GameScreen
          category={game.category}
          question={game.question}
          currentHint={game.currentHint}
          score={game.score}
          round={game.round}
          isPlaying={game.isPlaying}
          result={game.result}
          roundDuration={game.roundDuration}
          onNextHint={game.nextHint}
          onSubmitAnswer={game.submitAnswer}
          onTimeUp={game.endRound}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      )}

      {mode === "multiplayer" && (
        <MultiplayerLobby
          onBack={handleHome}
          onJoinRoom={(code) => console.log("Join room:", code)}
          onCreateRoom={() => console.log("Create room")}
        />
      )}
    </>
  );
};

export default Index;
