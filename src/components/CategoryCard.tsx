import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Film, PawPrint, MapPin, Package } from "lucide-react";

export type Category = "movies" | "animals" | "places" | "things";

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  selected?: boolean;
  delay?: number;
}

const categoryConfig = {
  movies: {
    icon: Film,
    label: "Movies",
    color: "from-neon-cyan to-primary",
    borderColor: "border-primary",
    glowClass: "neon-border-cyan",
  },
  animals: {
    icon: PawPrint,
    label: "Animals",
    color: "from-neon-green to-emerald-400",
    borderColor: "border-neon-green",
    glowClass: "shadow-[0_0_20px_hsl(150_100%_50%/0.3)]",
  },
  places: {
    icon: MapPin,
    label: "Places",
    color: "from-neon-magenta to-pink-400",
    borderColor: "border-secondary",
    glowClass: "neon-border-magenta",
  },
  things: {
    icon: Package,
    label: "Things",
    color: "from-neon-purple to-violet-400",
    borderColor: "border-accent",
    glowClass: "neon-glow-purple",
  },
};

const CategoryCard = ({ category, onClick, selected, delay = 0 }: CategoryCardProps) => {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Button
      variant="category"
      size="category"
      onClick={onClick}
      className={cn(
        "opacity-0 animate-slide-in-up",
        selected && `${config.borderColor} ${config.glowClass}`,
        !selected && "hover:border-muted-foreground/50"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div
        className={cn(
          "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br",
          config.color
        )}
      >
        <Icon className="w-8 h-8 md:w-10 md:h-10 text-background" />
      </div>
      <span className="font-display text-lg md:text-xl tracking-wider">{config.label}</span>
    </Button>
  );
};

export { CategoryCard, categoryConfig };
