import { useState, useCallback, useEffect } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { CategorySelect } from "@/components/CategorySelect";
import { GameScreen } from "@/components/GameScreen";
import { GameComplete } from "@/components/GameComplete";
import { MultiplayerLobby } from "@/components/MultiplayerLobby";
import { WaitingRoom } from "@/components/WaitingRoom";
import { QuestionMasterInput } from "@/components/QuestionMasterInput";
import { MultiplayerGameScreen } from "@/components/MultiplayerGameScreen";
import { MultiplayerRoundResult } from "@/components/MultiplayerRoundResult";
import { MultiplayerScoreboard } from "@/components/MultiplayerScoreboard";
import { useGame } from "@/hooks/useGame";
import { useMultiplayerGame, MultiplayerPlayer, RoundQuestion } from "@/hooks/useMultiplayerGame";
import { Helmet } from "react-helmet";
import { toast } from "sonner";

type GameMode = "home" | "category" | "playing" | "complete" | "multiplayer" | "waiting" | "multiplayer-playing";

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
  const [currentPlayerId, setCurrentPlayerId] = useState("");
  const game = useGame();
  const multiplayerGame = useMultiplayerGame(currentPlayerId);

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
    
    const playerId = crypto.randomUUID();
    setCurrentPlayerId(playerId);
    
    const currentPlayer: Player = {
      id: playerId,
      name: hostStatus ? "You (Host)" : "You",
      isHost: hostStatus,
    };
    
    if (hostStatus) {
      setPlayers([currentPlayer]);
    } else {
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
    multiplayerGame.resetGame();
    setMode("multiplayer");
  };

  const handleMultiplayerStart = () => {
    if (players.length < 2) {
      toast.error("Need at least 2 players to start");
      return;
    }
    if (players.length > 6) {
      toast.error("Maximum 6 players allowed");
      return;
    }
    
    // Initialize multiplayer game with players
    const mpPlayers: MultiplayerPlayer[] = players.map(p => ({
      ...p,
      score: 0,
      hasAnswered: false,
      answer: null,
      isCorrect: null,
      isConnected: true,
    }));
    
    multiplayerGame.initializeGame(mpPlayers);
    toast.success("Game starting!");
    setMode("multiplayer-playing");
  };

  // Start first round when game initializes
  useEffect(() => {
    if (mode === "multiplayer-playing" && multiplayerGame.roundPhase === "waiting" && multiplayerGame.players.length > 0) {
      multiplayerGame.startRound();
    }
  }, [mode, multiplayerGame.roundPhase, multiplayerGame.players.length]);

  // Start timer when guessing phase begins
  useEffect(() => {
    if (multiplayerGame.roundPhase === "guessing") {
      multiplayerGame.startTimer();
    }
    return () => multiplayerGame.stopTimer();
  }, [multiplayerGame.roundPhase]);

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
    multiplayerGame.resetGame();
    setRoomCode("");
    setIsHost(false);
    setPlayers([]);
    setMode("home");
  };

  const handleBackToLobby = () => {
    multiplayerGame.resetGame();
    setMode("waiting");
  };

  const handleMultiplayerPlayAgain = () => {
    const mpPlayers: MultiplayerPlayer[] = players.map(p => ({
      ...p,
      score: 0,
      hasAnswered: false,
      answer: null,
      isCorrect: null,
      isConnected: true,
    }));
    multiplayerGame.initializeGame(mpPlayers);
  };

  const handleSubmitQuestion = (question: RoundQuestion) => {
    multiplayerGame.submitQuestion(question);
  };

  const handleSubmitAnswer = (answer: string) => {
    multiplayerGame.submitAnswer(currentPlayerId, answer);
  };

  const handleNextMultiplayerRound = () => {
    multiplayerGame.startRound();
  };

  const handleEndMultiplayerGame = () => {
    multiplayerGame.resetGame();
    handleHome();
  };

  // Safe getters with fallbacks
  const currentPlayer = multiplayerGame.getCurrentPlayer();
  const questionMaster = multiplayerGame.getQuestionMaster();

  // Render based on mode
  const renderContent = () => {
    switch (mode) {
      case "home":
        return (
          <HomeScreen
            onSinglePlayer={handleSinglePlayer}
            onMultiplayer={handleMultiplayer}
          />
        );

      case "category":
        return (
          <CategorySelect
            selectedCategory={game.category}
            onSelectCategory={game.selectCategory}
            onStartGame={handleStartGame}
            onBack={handleHome}
          />
        );

      case "playing":
        if (!game.question || !game.category) {
          return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-muted-foreground">Loading game...</p>
              </div>
            </div>
          );
        }
        return (
          <GameScreen
            category={game.category}
            question={game.question}
            currentHint={game.currentHint}
            unlockedHints={game.unlockedHints}
            maxPoints={game.maxPoints}
            score={game.score}
            round={game.round}
            totalRounds={game.totalRounds}
            isPlaying={game.isPlaying}
            result={game.result}
            selectedAnswer={game.selectedAnswer}
            showResult={game.showResult}
            roundDuration={game.roundDuration}
            onUnlockHint={game.unlockHint}
            onSubmitAnswer={game.submitAnswer}
            onTimeUp={game.endRound}
            onNextRound={handleNextRound}
            onEndGame={handleHome}
          />
        );

      case "complete":
        return (
          <GameComplete
            score={game.score}
            totalRounds={game.totalRounds}
            correctAnswers={game.correctAnswers}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
          />
        );

      case "multiplayer":
        return (
          <MultiplayerLobby
            onBack={handleHome}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        );

      case "waiting":
        return (
          <WaitingRoom
            roomCode={roomCode}
            players={players}
            isHost={isHost}
            onBack={handleLeaveRoom}
            onStartGame={handleMultiplayerStart}
          />
        );

      case "multiplayer-playing":
        return renderMultiplayerPhase();

      default:
        return (
          <HomeScreen
            onSinglePlayer={handleSinglePlayer}
            onMultiplayer={handleMultiplayer}
          />
        );
    }
  };

  const renderMultiplayerPhase = () => {
    const { roundPhase, question, players: gamePlayers, currentRound, totalRounds, timeRemaining, correctGuessOrder, unlockedHints } = multiplayerGame;

    // Fallback for missing data
    if (!currentPlayer && roundPhase !== "game-complete") {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading player data...</p>
          </div>
        </div>
      );
    }

    switch (roundPhase) {
      case "waiting":
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
              <h2 className="font-display text-2xl mb-2">Starting Game...</h2>
              <p className="text-muted-foreground">Preparing the first round</p>
            </div>
          </div>
        );

      case "question-master-input":
        if (multiplayerGame.isQuestionMaster() && currentPlayer) {
          return (
            <QuestionMasterInput
              playerName={currentPlayer.name}
              roundNumber={currentRound}
              totalRounds={totalRounds}
              onSubmit={handleSubmitQuestion}
            />
          );
        }
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
              </div>
              <h2 className="font-display text-2xl mb-2">Waiting for Question Master</h2>
              <p className="text-muted-foreground">
                {questionMaster?.name || "Someone"} is creating the puzzle...
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Round {currentRound} of {totalRounds}
              </p>
            </div>
          </div>
        );

      case "guessing":
        if (!question || !currentPlayer || !questionMaster) {
          return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-muted-foreground">Loading question...</p>
              </div>
            </div>
          );
        }
        return (
          <MultiplayerGameScreen
            question={question}
            currentHint={multiplayerGame.currentHint}
            unlockedHints={unlockedHints}
            timeRemaining={timeRemaining}
            players={gamePlayers}
            questionMaster={questionMaster}
            currentPlayer={currentPlayer}
            isQuestionMaster={multiplayerGame.isQuestionMaster()}
            roundNumber={currentRound}
            totalRounds={totalRounds}
            onRevealHint={multiplayerGame.revealNextHint}
            onSubmitAnswer={handleSubmitAnswer}
            onTimeUp={multiplayerGame.endRound}
            onEndGame={handleEndMultiplayerGame}
          />
        );

      case "round-result":
        if (!question || !questionMaster) {
          return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-muted-foreground">Loading results...</p>
              </div>
            </div>
          );
        }
        return (
          <MultiplayerRoundResult
            question={question}
            players={gamePlayers}
            questionMaster={questionMaster}
            correctGuessOrder={correctGuessOrder}
            roundNumber={currentRound}
            totalRounds={totalRounds}
            onNextRound={handleNextMultiplayerRound}
            onEndGame={handleEndMultiplayerGame}
          />
        );

      case "game-complete":
        return (
          <MultiplayerScoreboard
            players={gamePlayers}
            onPlayAgain={handleMultiplayerPlayAgain}
            onHome={handleHome}
            onBackToLobby={handleBackToLobby}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-muted-foreground">Unknown game state</p>
            </div>
          </div>
        );
    }
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

      {renderContent()}
    </>
  );
};

export default Index;