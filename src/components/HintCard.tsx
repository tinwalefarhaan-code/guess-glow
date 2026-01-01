import { forwardRef } from "react";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { Lightbulb, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HintCardProps {
  hint: string;
  hintNumber: number;
  isUnlocked: boolean;
  isLocked: boolean;
  points: number;
  canUnlock?: boolean;
  onUnlock?: () => void;
}

const HintCard = forwardRef<HTMLDivElement, HintCardProps>(
  ({ hint, hintNumber, isUnlocked, isLocked, points, canUnlock = false, onUnlock }, ref) => {
    const colorClasses = {
      1: { text: "text-neon-green", glow: "neon-text-cyan", border: "border-neon-green/50", bg: "bg-neon-green/5" },
      2: { text: "text-neon-orange", glow: "", border: "border-neon-orange/50", bg: "bg-neon-orange/5" },
      3: { text: "text-secondary", glow: "neon-text-magenta", border: "border-secondary/50", bg: "bg-secondary/5" },
    };

    const colors = colorClasses[hintNumber as keyof typeof colorClasses] || colorClasses[1];
    
    // Safety check for hint
    const displayHint = hint || "Hint not available";

    return (
      <GlassCard
        ref={ref}
        className={cn(
          "transition-all duration-500 relative overflow-hidden",
          isUnlocked 
            ? `opacity-100 scale-100 ${colors.border} border-2 ${colors.bg}`
            : "opacity-70 scale-98 border-muted/30"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
              isUnlocked ? "bg-primary/20" : "bg-muted"
            )}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Lightbulb className={cn("w-5 h-5", isUnlocked ? colors.text : "text-muted-foreground")} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "font-display text-sm tracking-wider",
                isUnlocked ? colors.text : "text-muted-foreground"
              )}>
                HINT {hintNumber}
              </span>
              <span className={cn(
                "text-sm font-semibold",
                isUnlocked ? colors.text : "text-muted-foreground"
              )}>
                {points} pts
              </span>
            </div>
            
            {isLocked ? (
              <div className="relative">
                {/* Blurred hint text */}
                <p className="text-lg leading-relaxed text-muted-foreground blur-md select-none pointer-events-none">
                  {displayHint}
                </p>
                {/* Unlock button overlay */}
                {canUnlock && onUnlock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm rounded-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onUnlock}
                      className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-primary/20 border-primary/50 shadow-lg"
                    >
                      <Unlock className="w-4 h-4" />
                      Unlock Hint ({points} pts)
                    </Button>
                  </div>
                )}
                {/* Locked state without unlock button */}
                {!canUnlock && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Lock className="w-4 h-4" />
                      <span>Locked</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className={cn(
                "text-lg leading-relaxed break-words",
                isUnlocked ? "text-foreground" : "text-muted-foreground"
              )}>
                {displayHint}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }
);

HintCard.displayName = "HintCard";

export { HintCard };