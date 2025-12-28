import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  result?: "correct" | "wrong" | null;
}

const AnswerInput = ({ onSubmit, disabled, result }: AnswerInputProps) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (answer.trim() && !disabled) {
      onSubmit(answer.trim());
      setAnswer("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex gap-3 p-2 rounded-2xl transition-all duration-300",
          "glass-card",
          result === "correct" && "border-neon-green shadow-[0_0_30px_hsl(150_100%_50%/0.4)]",
          result === "wrong" && "border-destructive shadow-[0_0_30px_hsl(var(--destructive)/0.4)]"
        )}
      >
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          disabled={disabled}
          className={cn(
            "flex-1 h-14 text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50",
            result === "correct" && "text-neon-green",
            result === "wrong" && "text-destructive"
          )}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !answer.trim()}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-xl",
            result === "correct" && "bg-neon-green hover:bg-neon-green/90",
            result === "wrong" && "bg-destructive hover:bg-destructive/90"
          )}
        >
          {result === "correct" ? (
            <Check className="w-6 h-6" />
          ) : result === "wrong" ? (
            <X className="w-6 h-6" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </Button>
      </div>
      
      {result && (
        <div
          className={cn(
            "absolute -bottom-8 left-0 right-0 text-center font-display text-sm tracking-wider animate-fade-in",
            result === "correct" ? "text-neon-green" : "text-destructive"
          )}
        >
          {result === "correct" ? "CORRECT!" : "TRY AGAIN!"}
        </div>
      )}
    </div>
  );
};

export { AnswerInput };
