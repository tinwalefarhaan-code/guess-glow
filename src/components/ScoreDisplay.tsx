import { GlassCard } from "@/components/GlassCard";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  label?: string;
  animate?: boolean;
  className?: string;
}

const ScoreDisplay = ({ score, label = "Score", animate = false, className }: ScoreDisplayProps) => {
  return (
    <GlassCard
      glow="cyan"
      className={cn(
        "inline-flex items-center gap-3 py-3 px-5",
        animate && "animate-pulse-neon",
        className
      )}
    >
      <Trophy className="w-5 h-5 text-primary" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-display text-2xl font-bold text-primary neon-text-cyan">
          {score}
        </span>
      </div>
    </GlassCard>
  );
};

export { ScoreDisplay };
