import { Button } from "@/components/ui/button";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { Trophy, RotateCcw, Home, Share2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCompleteProps {
  score: number;
  totalRounds: number;
  correctAnswers: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

const GameComplete = ({
  score,
  totalRounds,
  correctAnswers,
  onPlayAgain,
  onHome,
}: GameCompleteProps) => {
  const maxScore = totalRounds * 10;
  const percentage = Math.round((score / maxScore) * 100);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "LEGENDARY!";
    if (percentage >= 70) return "AMAZING!";
    if (percentage >= 50) return "WELL DONE!";
    if (percentage >= 30) return "GOOD TRY!";
    return "KEEP PRACTICING!";
  };

  const getGlowColor = () => {
    if (percentage >= 70) return "cyan";
    if (percentage >= 40) return "magenta";
    return "magenta";
  };

  const handleShare = () => {
    const shareText = `🎭 I scored ${score} points (${correctAnswers}/${totalRounds} correct) playing Dumb Charades! Can you beat my score? Play now!`;
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: "Dumb Charades",
        text: shareText,
        url: shareUrl,
      });
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <GlassCard
        glow={getGlowColor()}
        className="max-w-md w-full text-center animate-scale-in p-8"
      >
        <div className="mb-6">
          <Trophy className={cn(
            "w-20 h-20 mx-auto mb-4",
            percentage >= 70 ? "text-neon-cyan" : "text-neon-magenta"
          )} />
          <NeonTitle
            as="h1"
            glow={getGlowColor()}
            size="xl"
            className="mb-2"
          >
            {getPerformanceMessage()}
          </NeonTitle>
          <p className="text-muted-foreground">Game Complete</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="glass-card rounded-xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Final Score</p>
            <p className="font-display text-4xl text-primary">{score}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-4">
              <p className="text-muted-foreground text-sm mb-1">Correct</p>
              <p className="font-display text-2xl text-neon-green">
                {correctAnswers}/{totalRounds}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-muted-foreground text-sm mb-1">Accuracy</p>
              <p className="font-display text-2xl text-neon-cyan">{percentage}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="neon"
            onClick={onPlayAgain}
            className="gap-2 w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            className="gap-2 w-full"
          >
            <Share2 className="w-4 h-4" />
            Share Score
          </Button>
          
          <Button
            variant="ghost"
            onClick={onHome}
            className="gap-2 w-full"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export { GameComplete };
