import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer } from "@/components/Timer";
import { HintCard } from "@/components/HintCard";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { OptionsGrid } from "@/components/OptionsGrid";
import { categoryConfig, Category } from "@/components/CategoryCard";
import { MultiplayerPlayer, RoundQuestion } from "@/hooks/useMultiplayerGame";
import { Send, Users, Crown, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiplayerGameScreenProps {
  question: RoundQuestion;
  currentHint: number;
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
}

const POINTS_BY_POSITION = [10, 7, 5];

const MultiplayerGameScreen = ({
  question,
  currentHint,
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
}: MultiplayerGameScreenProps) => {
  const [textAnswer, setTextAnswer] = useState("");
  const config = categoryConfig[question.category];
  const Icon = config.icon;
  
  const hasAnswered = currentPlayer.hasAnswered;
  const guessingPlayers = players.filter(p => p.id !== questionMaster.id);

  const handleTextSubmit = () => {
    if (textAnswer.trim() && !hasAnswered) {
      onSubmitAnswer(textAnswer.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && textAnswer.trim() && !hasAnswered) {
      handleTextSubmit();
    }
  };

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
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Question Master</p>
            <p className="font-semibold text-secondary">{questionMaster.name}</p>
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

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <Timer
            duration={120}
            onComplete={onTimeUp}
            isRunning={!hasAnswered}
            key={`${roundNumber}-${timeRemaining}`}
          />
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
                  Reveal Next Hint
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
            {/* Hints */}
            <div className="space-y-3">
              {question.hints.map((hint, index) => (
                <HintCard
                  key={index}
                  hint={hint}
                  hintNumber={index + 1}
                  isUnlocked={index <= currentHint}
                  isLocked={index > currentHint}
                  points={POINTS_BY_POSITION[index] || 0}
                  canUnlock={false}
                />
              ))}
            </div>

            {/* Answer Input */}
            {hasAnswered ? (
              <GlassCard
                glow={currentPlayer.isCorrect ? "cyan" : "magenta"}
                className="text-center"
              >
                <NeonTitle
                  as="h3"
                  glow={currentPlayer.isCorrect ? "cyan" : "magenta"}
                  size="md"
                  className="mb-2"
                >
                  {currentPlayer.isCorrect ? "CORRECT!" : "SUBMITTED"}
                </NeonTitle>
                <p className="text-muted-foreground">
                  Your answer: <span className="font-semibold">{currentPlayer.answer}</span>
                </p>
                {currentPlayer.isCorrect && (
                  <p className="text-neon-green mt-2">
                    Waiting for others to answer...
                  </p>
                )}
              </GlassCard>
            ) : question.hasOptions ? (
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
                    player.id === currentPlayer.id
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
