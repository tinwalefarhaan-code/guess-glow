import { useEffect, useState, useRef, forwardRef } from "react";
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
    const onCompleteRef = useRef(onComplete);
    const hasCompletedRef = useRef(false);

    // Update the ref when onComplete changes
    useEffect(() => {
      onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Reset timer when duration changes
    useEffect(() => {
      setTimeLeft(duration);
      hasCompletedRef.current = false;
    }, [duration]);

    useEffect(() => {
      if (!isRunning) return;

      // If time is already up, call complete once
      if (timeLeft <= 0) {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current();
        }
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            if (!hasCompletedRef.current) {
              hasCompletedRef.current = true;
              // Use setTimeout to avoid calling during render
              setTimeout(() => onCompleteRef.current(), 0);
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const percentage = duration > 0 ? (timeLeft / duration) * 100 : 0;
    const isLow = timeLeft <= 10;
    const isCritical = timeLeft <= 5;

    const minutes = Math.floor(Math.max(0, timeLeft) / 60);
    const seconds = Math.max(0, timeLeft) % 60;

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
  }
);

Timer.displayName = "Timer";

export { Timer };