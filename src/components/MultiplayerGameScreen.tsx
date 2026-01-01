import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HintCard } from "@/components/HintCard";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { OptionsGrid } from "@/components/OptionsGrid";
import { categoryConfig, Category } from "@/components/CategoryCard";
import { MultiplayerPlayer, RoundQuestion } from "@/hooks/useMultiplayerGame";
import { Send, Users, Check, X, Clock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MultiplayerGameScreenProps {
  question: RoundQuestion;
  currentHint: number;
  unlockedHints: boolean[];
  timeRemaining: number;
  players: MultiplayerPlayer[];
  questionMaster: MultiplayerPlayer;
  currentPlayer: MultiplayerPlayer;
  isQuestionMaster: boolean;
  roundNumber: number;
  totalRounds: number;
  onRevealHint: () => void;
  onSubmitAnswer: (answer: string) => void;
  onTimeUp: () => void;
  onEndGame: () => void;
}

const POINTS_BY_POSITION = [10, 7, 5];

const MultiplayerGameScreen = ({
  question,
  currentHint,
  unlockedHints,
  timeRemaining,
  players,
  questionMaster,
  currentPlayer,
  isQuestionMaster,
  roundNumber,
  totalRounds,
  onRevealHint,
  onSubmitAnswer,
  onTimeUp,
  onEndGame,
}: MultiplayerGameScreenProps) => {
  const [textAnswer, setTextAnswer] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  const config = question?.category ? categoryConfig[question.category] : null;
  const Icon = config?.icon;
  
  const hasAnswered = currentPlayer?.hasAnswered || false;
  const guessingPlayers = players.filter(p => p.id !== questionMaster?.id);

  // Format time display
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 30;
  const isCriticalTime = timeRemaining <= 10;

  const handleTextSubmit = () => {
    if (textAnswer.trim() && !hasAnswered) {
      onSubmitAnswer(textAnswer.trim());
      setTextAnswer("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && textAnswer.trim() && !hasAnswered) {
      handleTextSubmit();
    }
  };

  if (!question || !config || !Icon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
              config.color
            )}>
              <Icon className="w-6 h-6 text-background" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Round {roundNumber} of {totalRounds}
              </p>
              <p className="font-display text-lg">{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Question Master</p>
              <p className="font-semibold text-secondary">{questionMaster?.name || "Unknown"}</p>
            </div>
            <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background/95 backdrop-blur-lg border-border/50">
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to leave? You'll lose all progress.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Playing</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onEndGame}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Leave Game
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-500"
              style={{ width: `${(roundNumber / totalRounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex justify-center mb-6">
          <div className={cn(
            "px-6 py-3 rounded-2xl border-2 font-display text-3xl font-bold transition-all",
            isCriticalTime 
              ? "border-destructive bg-destructive/10 text-destructive animate-pulse"
              : isLowTime
                ? "border-neon-orange bg-neon-orange/10 text-neon-orange"
                : "border-primary bg-primary/10 text-primary"
          )}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        {/* Question Master View */}
        {isQuestionMaster ? (
          <div className="space-y-6">
            <GlassCard glow="magenta" className="text-center">
              <NeonTitle as="h3" glow="magenta" size="md" className="mb-2">
                YOU ARE THE QUESTION MASTER
              </NeonTitle>
              <p className="text-muted-foreground mb-4">
                Watch as others try to guess your puzzle!
              </p>
              <div className="p-4 rounded-xl bg-muted/30 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Your Answer</p>
                <p className="font-display text-2xl text-primary">{question.answer}</p>
              </div>
              
              {/* Hint reveal button */}
              {currentHint < 2 && (
                <Button variant="outline" onClick={onRevealHint} className="gap-2">
                  Reveal Hint {currentHint + 2}
                </Button>
              )}
            </GlassCard>

            {/* Player Progress */}
            <GlassCard>
              <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Player Progress
              </h3>
              <div className="space-y-2">
                {guessingPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl",
                      player.hasAnswered
                        ? player.isCorrect
                          ? "bg-neon-green/10 border border-neon-green/30"
                          : "bg-destructive/10 border border-destructive/30"
                        : "bg-muted/30"
                    )}
                  >
                    <span className="font-medium">{player.name}</span>
                    <div className="flex items-center gap-2">
                      {player.hasAnswered ? (
                        player.isCorrect ? (
                          <Check className="w-5 h-5 text-neon-green" />
                        ) : (
                          <X className="w-5 h-5 text-destructive" />
                        )
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ) : (
          /* Guessing Player View */
          <div className="space-y-6">
            {/* Hints with lock/unlock */}
            <div className="space-y-3">
              {question.hints.map((hint, index) => (
                <HintCard
                  key={index}
                  hint={hint}
                  hintNumber={index + 1}
                  isUnlocked={unlockedHints[index] || false}
                  isLocked={!unlockedHints[index]}
                  points={POINTS_BY_POSITION[index] || 0}
                  canUnlock={false}
                />
              ))}
            </div>

            {/* Answer Input */}
            {hasAnswered ? (
              <GlassCard
                glow={currentPlayer?.isCorrect ? "cyan" : "magenta"}
                className="text-center"
              >
                <NeonTitle
                  as="h3"
                  glow={currentPlayer?.isCorrect ? "cyan" : "magenta"}
                  size="md"
                  className="mb-2"
                >
                  {currentPlayer?.isCorrect ? "CORRECT!" : "SUBMITTED"}
                </NeonTitle>
                <p className="text-muted-foreground">
                  Your answer: <span className="font-semibold">{currentPlayer?.answer || "N/A"}</span>
                </p>
                {currentPlayer?.isCorrect && (
                  <p className="text-neon-green mt-2">
                    Waiting for others to answer...
                  </p>
                )}
              </GlassCard>
            ) : question.hasOptions && question.options.length > 0 ? (
              <OptionsGrid
                options={question.options}
                correctAnswer={question.answer}
                selectedAnswer={null}
                onSelect={onSubmitAnswer}
                disabled={hasAnswered}
                showResult={false}
              />
            ) : (
              <GlassCard>
                <p className="text-sm text-muted-foreground mb-3">Type your answer</p>
                <div className="flex gap-3">
                  <Input
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your guess..."
                    className="flex-1"
                    disabled={hasAnswered}
                  />
                  <Button
                    variant="neon"
                    onClick={handleTextSubmit}
                    disabled={!textAnswer.trim() || hasAnswered}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Other Players Status */}
            <div className="flex flex-wrap gap-2 justify-center">
              {guessingPlayers.map((player) => (
                <div
                  key={player.id}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm flex items-center gap-1",
                    player.id === currentPlayer?.id
                      ? "bg-primary/20 text-primary"
                      : player.hasAnswered
                        ? "bg-muted/50 text-muted-foreground"
                        : "bg-muted/20 text-muted-foreground"
                  )}
                >
                  {player.hasAnswered && <Check className="w-3 h-3" />}
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { MultiplayerGameScreen };
