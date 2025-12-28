import { Button } from "@/components/ui/button";
import { Timer } from "@/components/Timer";
import { HintCard } from "@/components/HintCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { AnswerInput } from "@/components/AnswerInput";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { categoryConfig, Category } from "@/components/CategoryCard";
import { ChevronRight, RotateCcw, Home, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameScreenProps {
  category: Category;
  question: { answer: string; hints: string[] };
  currentHint: number;
  score: number;
  round: number;
  isPlaying: boolean;
  result: "correct" | "wrong" | null;
  roundDuration: number;
  onNextHint: () => void;
  onSubmitAnswer: (answer: string) => void;
  onTimeUp: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
}

const POINTS_PER_HINT = [10, 7, 5];

const GameScreen = ({
  category,
  question,
  currentHint,
  score,
  round,
  isPlaying,
  result,
  roundDuration,
  onNextHint,
  onSubmitAnswer,
  onTimeUp,
  onPlayAgain,
  onHome,
}: GameScreenProps) => {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const hasWon = result === "correct";
  const hasLost = !isPlaying && !hasWon && round > 0;

  const handleShare = () => {
    const shareText = `🎭 I scored ${score} points playing Dumb Charades! Can you beat my score? Play now!`;
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: "Dumb Charades",
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback to WhatsApp
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
        "_blank"
      );
    }
  };

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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Round {round}</p>
              <p className="font-display text-lg">{config.label}</p>
            </div>
          </div>
          <ScoreDisplay score={score} animate={hasWon} />
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-8">
          <Timer
            duration={roundDuration}
            onComplete={onTimeUp}
            isRunning={isPlaying && !hasWon}
          />
        </div>

        {/* Hints */}
        <div className="space-y-4 mb-8">
          {question.hints.map((hint, index) => (
            <HintCard
              key={index}
              hint={hint}
              hintNumber={index + 1}
              isActive={index <= currentHint}
              points={POINTS_PER_HINT[index]}
            />
          ))}
        </div>

        {/* Next Hint Button */}
        {isPlaying && !hasWon && currentHint < 2 && (
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              onClick={onNextHint}
              className="gap-2"
            >
              Next Hint
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Answer Input */}
        {isPlaying && !hasWon && (
          <div className="mb-8">
            <AnswerInput
              onSubmit={onSubmitAnswer}
              disabled={hasWon}
              result={result}
            />
          </div>
        )}

        {/* Result Screen */}
        {!isPlaying && (
          <GlassCard
            glow={hasWon ? "cyan" : "magenta"}
            className="text-center animate-scale-in"
          >
            <NeonTitle
              as="h2"
              glow={hasWon ? "cyan" : "magenta"}
              size="lg"
              className="mb-4"
            >
              {hasWon ? "CORRECT!" : "TIME'S UP!"}
            </NeonTitle>
            
            <p className="text-xl mb-2">
              The answer was:{" "}
              <span className="font-display text-primary font-bold">
                {question.answer}
              </span>
            </p>
            
            {hasWon && (
              <p className="text-muted-foreground mb-6">
                You earned{" "}
                <span className="text-primary font-bold">
                  {POINTS_PER_HINT[currentHint]} points
                </span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button
                variant="neon"
                onClick={onPlayAgain}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Score
              </Button>
              
              <Button
                variant="ghost"
                onClick={onHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export { GameScreen };
