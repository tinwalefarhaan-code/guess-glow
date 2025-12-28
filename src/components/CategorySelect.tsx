import { Button } from "@/components/ui/button";
import { NeonTitle } from "@/components/NeonTitle";
import { CategoryCard, Category } from "@/components/CategoryCard";
import { ArrowLeft, Play } from "lucide-react";

interface CategorySelectProps {
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
  onStartGame: () => void;
  onBack: () => void;
}

const categories: Category[] = ["movies", "animals", "places", "things"];

const CategorySelect = ({
  selectedCategory,
  onSelectCategory,
  onStartGame,
  onBack,
}: CategorySelectProps) => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 opacity-0 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Title */}
        <div className="text-center mb-10 opacity-0 animate-fade-in stagger-1">
          <NeonTitle glow="gradient" size="lg" className="mb-3">
            CHOOSE CATEGORY
          </NeonTitle>
          <p className="text-muted-foreground text-lg">
            Select a category to start playing
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
          {categories.map((category, index) => (
            <CategoryCard
              key={category}
              category={category}
              onClick={() => onSelectCategory(category)}
              selected={selectedCategory === category}
              delay={200 + index * 100}
            />
          ))}
        </div>

        {/* Start Button */}
        <div className="flex justify-center opacity-0 animate-fade-in stagger-5">
          <Button
            variant="neon"
            size="xl"
            onClick={onStartGame}
            disabled={!selectedCategory}
            className="gap-3 min-w-[200px]"
          >
            <Play className="w-5 h-5" />
            START GAME
          </Button>
        </div>
      </div>
    </div>
  );
};

export { CategorySelect };
