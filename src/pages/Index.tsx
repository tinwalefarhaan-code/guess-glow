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

  const currentPlayer = multiplayerGame.getCurrentPlayer();
  const questionMaster = multiplayerGame.getQuestionMaster();

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

      {mode === "multiplayer-playing" && multiplayerGame.roundPhase === "question-master-input" && currentPlayer && (
        multiplayerGame.isQuestionMaster() ? (
          <QuestionMasterInput
            playerName={currentPlayer.name}
            roundNumber={multiplayerGame.currentRound}
            totalRounds={multiplayerGame.totalRounds}
            onSubmit={handleSubmitQuestion}
          />
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
              </div>
              <h2 className="font-display text-2xl mb-2">Waiting for Question Master</h2>
              <p className="text-muted-foreground">
                {questionMaster?.name} is creating the puzzle...
              </p>
            </div>
          </div>
        )
      )}

      {mode === "multiplayer-playing" && multiplayerGame.roundPhase === "guessing" && multiplayerGame.question && currentPlayer && questionMaster && (
        <MultiplayerGameScreen
          question={multiplayerGame.question}
          currentHint={multiplayerGame.currentHint}
          timeRemaining={multiplayerGame.timeRemaining}
          players={multiplayerGame.players}
          questionMaster={questionMaster}
          currentPlayer={currentPlayer}
          isQuestionMaster={multiplayerGame.isQuestionMaster()}
          roundNumber={multiplayerGame.currentRound}
          totalRounds={multiplayerGame.totalRounds}
          onRevealHint={multiplayerGame.revealNextHint}
          onSubmitAnswer={handleSubmitAnswer}
          onTimeUp={multiplayerGame.endRound}
        />
      )}

      {mode === "multiplayer-playing" && multiplayerGame.roundPhase === "round-result" && multiplayerGame.question && questionMaster && (
        <MultiplayerRoundResult
          question={multiplayerGame.question}
          players={multiplayerGame.players}
          questionMaster={questionMaster}
          correctGuessOrder={multiplayerGame.correctGuessOrder}
          roundNumber={multiplayerGame.currentRound}
          totalRounds={multiplayerGame.totalRounds}
          onNextRound={handleNextMultiplayerRound}
        />
      )}

      {mode === "multiplayer-playing" && multiplayerGame.roundPhase === "game-complete" && (
        <MultiplayerScoreboard
          players={multiplayerGame.players}
          onPlayAgain={handleMultiplayerPlayAgain}
          onHome={handleHome}
        />
      )}
    </>
  );
};

export default Index;
