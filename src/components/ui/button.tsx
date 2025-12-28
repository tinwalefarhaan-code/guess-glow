import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-display uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-cyan hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 neon-border-cyan hover:scale-105",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 neon-glow-magenta hover:scale-105",
        ghost: 
          "hover:bg-primary/10 hover:text-primary",
        link: 
          "text-primary underline-offset-4 hover:underline",
        neon:
          "relative overflow-hidden bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple text-background font-bold hover:scale-105 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-neon-cyan before:via-neon-magenta before:to-neon-purple before:opacity-0 before:transition-opacity hover:before:opacity-100 before:blur-xl before:-z-10",
        glass:
          "glass-card border-primary/30 text-foreground hover:border-primary/60 hover:scale-105 neon-border-cyan",
        category:
          "glass-card border-2 border-transparent text-foreground hover:border-primary hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center min-h-[120px] gap-2",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 rounded-xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-12 w-12",
        category: "h-auto p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
