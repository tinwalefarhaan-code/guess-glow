import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

interface HintCardProps {
  hint: string;
  hintNumber: number;
  isActive: boolean;
  points: number;
}

const HintCard = ({ hint, hintNumber, isActive, points }: HintCardProps) => {
  const colorClasses = {
    1: { text: "text-neon-green", glow: "neon-text-cyan", border: "border-neon-green/50" },
    2: { text: "text-neon-orange", glow: "", border: "border-neon-orange/50" },
    3: { text: "text-secondary", glow: "neon-text-magenta", border: "border-secondary/50" },
  };

  const colors = colorClasses[hintNumber as keyof typeof colorClasses] || colorClasses[1];

  return (
    <GlassCard
      className={cn(
        "transition-all duration-500",
        isActive 
          ? `opacity-100 scale-100 ${colors.border} border-2`
          : "opacity-40 scale-95 blur-[2px]"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isActive ? "bg-primary/20" : "bg-muted"
          )}
        >
          <Lightbulb className={cn("w-5 h-5", isActive ? colors.text : "text-muted-foreground")} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("font-display text-sm tracking-wider", colors.text)}>
              HINT {hintNumber}
            </span>
            <span className={cn("text-sm font-semibold", colors.text)}>
              {points} pts
            </span>
          </div>
          <p className={cn(
            "text-lg leading-relaxed",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}>
            {hint}
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export { HintCard };
