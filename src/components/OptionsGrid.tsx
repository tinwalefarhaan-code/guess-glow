import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";
import { Check, X } from "lucide-react";

interface OptionsGridProps {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  disabled: boolean;
  showResult: boolean;
}

const OptionsGrid = ({
  options,
  correctAnswer,
  selectedAnswer,
  onSelect,
  disabled,
  showResult,
}: OptionsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option, index) => {
        const isCorrect = option === correctAnswer;
        const isSelected = option === selectedAnswer;
        const showCorrectHighlight = showResult && isCorrect;
        const showWrongHighlight = showResult && isSelected && !isCorrect;

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelect(option)}
            disabled={disabled}
            className={cn(
              "relative p-4 rounded-xl text-left transition-all duration-300",
              "glass-card hover:scale-[1.02] active:scale-[0.98]",
              "font-medium text-base md:text-lg",
              "border-2",
              !showResult && !disabled && "hover:border-primary/50 cursor-pointer",
              !showResult && isSelected && "border-primary bg-primary/10",
              !showResult && !isSelected && "border-transparent",
              showCorrectHighlight && "border-neon-green bg-neon-green/20 shadow-[0_0_20px_hsl(150_100%_50%/0.3)]",
              showWrongHighlight && "border-destructive bg-destructive/20 shadow-[0_0_20px_hsl(var(--destructive)/0.3)]",
              showResult && !isCorrect && !isSelected && "opacity-50",
              disabled && !showResult && "cursor-not-allowed opacity-70"
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display",
                  "bg-primary/20 text-primary",
                  showCorrectHighlight && "bg-neon-green/30 text-neon-green",
                  showWrongHighlight && "bg-destructive/30 text-destructive"
                )}
              >
                {showCorrectHighlight ? (
                  <Check className="w-4 h-4" />
                ) : showWrongHighlight ? (
                  <X className="w-4 h-4" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span className={cn(
                showCorrectHighlight && "text-neon-green",
                showWrongHighlight && "text-destructive"
              )}>
                {option}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export { OptionsGrid };
