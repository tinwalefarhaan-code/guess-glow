import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "@/components/Timer";
import { HintCard } from "@/components/HintCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { OptionsGrid } from "@/components/OptionsGrid";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { categoryConfig, Category } from "@/components/CategoryCard";
import { ChevronRight, ArrowRight, X } from "lucide-react";
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

interface GameScreenProps {
  category: Category;
  question: { answer: string; hints: string[]; options: string[] };
  currentHint: number;
  unlockedHints: boolean[];
  maxPoints: number;
  score: number;
  round: number;
  totalRounds: number;
  isPlaying: boolean;
  result: "correct" | "wrong" | null;
  selectedAnswer: string | null;
  showResult: boolean;
  roundDuration: number;
  onUnlockHint: (hintIndex: number) => void;
  onSubmitAnswer: (answer: string) => void;
  onTimeUp: () => void;
  onNextRound: () => void;
  onEndGame: () => void;
}

const POINTS_PER_HINT = [10, 7, 5];

const GameScreen = ({
  category,
  question,
  currentHint,
  unlockedHints,
  maxPoints,
  score,
  round,
  totalRounds,
  isPlaying,
  result,
  selectedAnswer,
  showResult,
  roundDuration,
  onUnlockHint,
  onSubmitAnswer,
  onTimeUp,
  onNextRound,
  onEndGame,
}: GameScreenProps) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                config.color
              )}
            >
              <Icon className="w-6 h-6 text-background" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Round {round} of {totalRounds}
              </p>
              <p className="font-display text-lg">{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreDisplay score={score} animate={result === "correct"} />
            <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background/95 backdrop-blur-lg border-border/50">
                <AlertDialogHeader>
                  <AlertDialogTitle>End Game?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to end the game? Your progress will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Playing</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onEndGame}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    End Game
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
              style={{ width: `${(round / totalRounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <Timer
            duration={roundDuration}
            onComplete={onTimeUp}
            isRunning={isPlaying && !showResult}
            key={round}
          />
        </div>

        {/* Hints */}
        <div className="space-y-3 mb-6">
          {question.hints.map((hint, index) => (
            <HintCard
              key={index}
              hint={hint}
              hintNumber={index + 1}
              isUnlocked={unlockedHints[index]}
              isLocked={!unlockedHints[index]}
              points={POINTS_PER_HINT[index]}
              canUnlock={index > 0 && !unlockedHints[index] && unlockedHints[index - 1] && isPlaying && !showResult}
              onUnlock={() => onUnlockHint(index)}
            />
          ))}
        </div>

        {/* MCQ Options */}
        <div className="mb-6">
          <OptionsGrid
            options={question.options}
            correctAnswer={question.answer}
            selectedAnswer={selectedAnswer}
            onSelect={onSubmitAnswer}
            disabled={showResult}
            showResult={showResult}
          />
        </div>

        {/* Result Feedback & Next Round */}
        {showResult && (
          <GlassCard
            glow={result === "correct" ? "cyan" : "magenta"}
            className="text-center animate-scale-in p-6"
          >
            <NeonTitle
              as="h3"
              glow={result === "correct" ? "cyan" : "magenta"}
              size="md"
              className="mb-2"
            >
              {result === "correct" ? "CORRECT!" : "WRONG!"}
            </NeonTitle>
            
            {result === "correct" && (
              <p className="text-muted-foreground mb-4">
                +{maxPoints} points
              </p>
            )}
            
            {result === "wrong" && (
              <p className="text-muted-foreground mb-4">
                The answer was:{" "}
                <span className="text-primary font-bold">{question.answer}</span>
              </p>
            )}

            <Button
              variant="neon"
              onClick={onNextRound}
              className="gap-2"
            >
              {round >= totalRounds ? "See Results" : "Next Round"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export { GameScreen };
