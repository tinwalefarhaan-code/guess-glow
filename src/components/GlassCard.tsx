import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "cyan" | "magenta" | "purple" | "none";
  hover?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = "none", hover = false, children, ...props }, ref) => {
    const glowClasses = {
      cyan: "neon-border-cyan",
      magenta: "neon-border-magenta",
      purple: "neon-glow-purple",
      none: "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-6",
          glowClasses[glow],
          hover && "transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
