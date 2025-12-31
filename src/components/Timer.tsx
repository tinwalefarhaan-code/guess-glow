import { useEffect, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number;
  onComplete: () => void;
  isRunning: boolean;
  className?: string;
}

const Timer = forwardRef<HTMLDivElement, TimerProps>(
  ({ duration, onComplete, isRunning, className }, ref) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRunning, onComplete]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={isCritical ? "hsl(var(--destructive))" : isLow ? "hsl(var(--neon-orange))" : "hsl(var(--primary))"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83} 283`}
            className={cn(
              "transition-all duration-1000",
              isCritical && "animate-pulse"
            )}
            style={{
              filter: isCritical 
                ? "drop-shadow(0 0 10px hsl(var(--destructive)))" 
                : isLow 
                  ? "drop-shadow(0 0 10px hsl(var(--neon-orange)))"
                  : "drop-shadow(0 0 10px hsl(var(--primary)))"
            }}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-display text-2xl md:text-3xl font-bold",
              isCritical ? "text-destructive animate-pulse" : isLow ? "text-neon-orange" : "text-primary"
            )}
            style={{
              textShadow: isCritical 
                ? "0 0 20px hsl(var(--destructive))"
                : isLow
                  ? "0 0 20px hsl(var(--neon-orange))"
                  : "0 0 20px hsl(var(--primary))"
            }}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
});

Timer.displayName = "Timer";

export { Timer };
