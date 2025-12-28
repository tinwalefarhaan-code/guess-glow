import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface NeonTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  glow?: "cyan" | "magenta" | "purple" | "gradient";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const NeonTitle = ({
  as: Component = "h1",
  glow = "cyan",
  size = "xl",
  className,
  children,
  ...props
}: NeonTitleProps) => {
  const glowClasses = {
    cyan: "text-primary neon-text-cyan",
    magenta: "text-secondary neon-text-magenta",
    purple: "text-accent neon-text-purple",
    gradient: "gradient-neon-text",
  };

  const sizeClasses = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
    xl: "text-3xl md:text-5xl",
    "2xl": "text-4xl md:text-6xl lg:text-7xl",
  };

  return (
    <Component
      className={cn(
        "font-display font-bold tracking-wider",
        glowClasses[glow],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export { NeonTitle };
