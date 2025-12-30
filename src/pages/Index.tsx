import { useState, useCallback } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { CategorySelect } from "@/components/CategorySelect";
import { GameScreen } from "@/components/GameScreen";
import { GameComplete } from "@/components/GameComplete";
import { MultiplayerLobby } from "@/components/MultiplayerLobby";
import { WaitingRoom } from "@/components/WaitingRoom";
import { useGame } from "@/hooks/useGame";
import { Helmet } from "react-helmet";
import { toast } from "sonner";

type GameMode = "home" | "category" | "playing" | "complete" | "multiplayer" | "waiting";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

const Index = () => {
  const [mode, setMode] = useState<GameMode>("home");
  const [roomCode, setRoomCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const game = useGame();

  const handleSinglePlayer = () => {
    setMode("category");
  };

  const handleMultiplayer = () => {
    setMode("multiplayer");
  };

  const handleCreateRoom = (code: string) => {
    setRoomCode(code);
    toast.success("Room created! Share the code with friends.");
  };

  const handleJoinRoom = (code: string, hostStatus: boolean) => {
    setRoomCode(code);
    setIsHost(hostStatus);
    
    // Initialize players list with current user
    const currentPlayer: Player = {
      id: crypto.randomUUID(),
      name: hostStatus ? "You (Host)" : "You",
      isHost: hostStatus,
    };
    
    if (hostStatus) {
      setPlayers([currentPlayer]);
    } else {
      // Simulate joining - in real app, would fetch from server
      const hostPlayer: Player = {
        id: crypto.randomUUID(),
        name: "Host",
        isHost: true,
      };
      setPlayers([hostPlayer, currentPlayer]);
      toast.success(`Joined room ${code}!`);
    }
    
    setMode("waiting");
  };

  const handleLeaveRoom = () => {
    setRoomCode("");
    setIsHost(false);
    setPlayers([]);
    setMode("multiplayer");
  };

  const handleMultiplayerStart = () => {
    if (players.length < 2) {
      toast.error("Need at least 2 players to start");
      return;
    }
    toast.success("Game starting!");
    // For now, transition to category select
    // In full implementation, would sync with all players
    setMode("category");
  };

  const handleStartGame = () => {
    game.startGame();
    setMode("playing");
  };

  const handleNextRound = () => {
    if (game.round >= game.totalRounds) {
      setMode("complete");
    } else {
      game.nextRound();
    }
  };

  const handlePlayAgain = () => {
    game.playAgain();
    game.startGame();
    setMode("playing");
  };

  const handleHome = () => {
    game.resetGame();
    setRoomCode("");
    setIsHost(false);
    setPlayers([]);
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
          totalRounds={game.totalRounds}
          isPlaying={game.isPlaying}
          result={game.result}
          selectedAnswer={game.selectedAnswer}
          showResult={game.showResult}
          roundDuration={game.roundDuration}
          onNextHint={game.nextHint}
          onSubmitAnswer={game.submitAnswer}
          onTimeUp={game.endRound}
          onNextRound={handleNextRound}
          onEndGame={handleHome}
        />
      )}

      {mode === "complete" && (
        <GameComplete
          score={game.score}
          totalRounds={game.totalRounds}
          correctAnswers={game.correctAnswers}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      )}

      {mode === "multiplayer" && (
        <MultiplayerLobby
          onBack={handleHome}
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
        />
      )}

      {mode === "waiting" && (
        <WaitingRoom
          roomCode={roomCode}
          players={players}
          isHost={isHost}
          onBack={handleLeaveRoom}
          onStartGame={handleMultiplayerStart}
        />
      )}
    </>
  );
};

export default Index;
