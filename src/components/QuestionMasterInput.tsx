import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { CategoryCard, Category, categoryConfig } from "@/components/CategoryCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Lightbulb, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { RoundQuestion } from "@/hooks/useMultiplayerGame";

interface QuestionMasterInputProps {
  playerName: string;
  roundNumber: number;
  totalRounds: number;
  onSubmit: (question: RoundQuestion) => void;
}

const categories: Category[] = ["movies", "animals", "places", "things"];

const QuestionMasterInput = ({
  playerName,
  roundNumber,
  totalRounds,
  onSubmit,
}: QuestionMasterInputProps) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");
  const [hint3, setHint3] = useState("");
  const [hasOptions, setHasOptions] = useState(true);
  const [options, setOptions] = useState(["", "", "", ""]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateAndSubmit = () => {
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!answer.trim()) {
      toast.error("Please enter the correct answer");
      return;
    }
    if (!hint1.trim() || !hint2.trim() || !hint3.trim()) {
      toast.error("Please fill in all three hints");
      return;
    }
    if (hasOptions) {
      const filledOptions = options.filter(o => o.trim());
      if (filledOptions.length < 4) {
        toast.error("Please fill in all 4 options");
        return;
      }
      if (!options.some(o => o.trim().toLowerCase() === answer.trim().toLowerCase())) {
        toast.error("One of the options must be the correct answer");
        return;
      }
    }

    const question: RoundQuestion = {
      category,
      answer: answer.trim(),
      hints: [hint1.trim(), hint2.trim(), hint3.trim()],
      hasOptions,
      options: hasOptions 
        ? options.map(o => o.trim()).sort(() => Math.random() - 0.5)
        : [],
    };

    onSubmit(question);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-4">
            <span className="text-secondary font-semibold">Round {roundNumber}/{totalRounds}</span>
          </div>
          <NeonTitle glow="magenta" size="lg" className="mb-2">
            YOU ARE THE QUESTION MASTER
          </NeonTitle>
          <p className="text-muted-foreground">
            {playerName}, create a puzzle for others to guess!
          </p>
        </div>

        {/* Category Selection */}
        <GlassCard className="mb-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">1</span>
            Select Category
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    category === cat
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg mb-2 flex items-center justify-center bg-gradient-to-br ${config.color}`}>
                    <Icon className="w-5 h-5 text-background" />
                  </div>
                  <span className="font-semibold">{config.label}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Answer Input */}
        <GlassCard className="mb-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">2</span>
            Enter the Correct Answer
            <span className="text-xs text-muted-foreground ml-auto">(Hidden from others)</span>
          </h3>
          <div className="relative">
            <Input
              type={showAnswer ? "text" : "password"}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the correct answer..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </GlassCard>

        {/* Hints Input */}
        <GlassCard className="mb-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">3</span>
            Create Three Hints
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-destructive" />
                <span>Hint 1 - Hard (vague, descriptive)</span>
              </Label>
              <Textarea
                value={hint1}
                onChange={(e) => setHint1(e.target.value)}
                placeholder="A very indirect clue... no letters or word length!"
                className="resize-none"
                rows={2}
              />
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-secondary" />
                <span>Hint 2 - Medium (functional/contextual)</span>
              </Label>
              <Textarea
                value={hint2}
                onChange={(e) => setHint2(e.target.value)}
                placeholder="More context, but still no letters!"
                className="resize-none"
                rows={2}
              />
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-neon-green" />
                <span>Hint 3 - Easy (letter-based)</span>
              </Label>
              <Textarea
                value={hint3}
                onChange={(e) => setHint3(e.target.value)}
                placeholder="e.g., '5 letters, starts with D'"
                className="resize-none"
                rows={2}
              />
            </div>
          </div>
        </GlassCard>

        {/* Answer Format */}
        <GlassCard className="mb-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm">4</span>
            Answer Format
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Include Multiple Choice Options</p>
              <p className="text-sm text-muted-foreground">
                {hasOptions ? "Players will pick from 4 options" : "Players will type their answer"}
              </p>
            </div>
            <Switch checked={hasOptions} onCheckedChange={setHasOptions} />
          </div>
          
          {hasOptions && (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Enter 4 options (include the correct answer)
              </p>
              {options.map((opt, idx) => (
                <Input
                  key={idx}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </GlassCard>

        {/* Submit Button */}
        <Button
          variant="neon"
          size="xl"
          onClick={validateAndSubmit}
          className="w-full gap-2"
        >
          <Send className="w-5 h-5" />
          SUBMIT QUESTION
        </Button>
      </div>
    </div>
  );
};

export { QuestionMasterInput };
