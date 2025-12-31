import { Button } from "@/components/ui/button";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { MultiplayerPlayer, RoundQuestion } from "@/hooks/useMultiplayerGame";
import { ArrowRight, Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiplayerRoundResultProps {
  question: RoundQuestion;
  players: MultiplayerPlayer[];
  questionMaster: MultiplayerPlayer;
  correctGuessOrder: string[];
  roundNumber: number;
  totalRounds: number;
  onNextRound: () => void;
}

const POINTS_BY_POSITION = [10, 7, 5];
const POSITION_ICONS = [Trophy, Medal, Award];
const POSITION_COLORS = ["text-yellow-400", "text-gray-400", "text-amber-600"];

const MultiplayerRoundResult = ({
  question,
  players,
  questionMaster,
  correctGuessOrder,
  roundNumber,
  totalRounds,
  onNextRound,
}: MultiplayerRoundResultProps) => {
  const noOneGuessed = correctGuessOrder.length === 0;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Get players who guessed correctly in order
  const correctGuessers = correctGuessOrder
    .map(id => players.find(p => p.id === id))
    .filter(Boolean) as MultiplayerPlayer[];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">
            Round {roundNumber} of {totalRounds}
          </p>
          <NeonTitle glow="gradient" size="lg" className="mb-4">
            ROUND COMPLETE
          </NeonTitle>
        </div>

        {/* Correct Answer Reveal */}
        <GlassCard glow="cyan" className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">The answer was</p>
          <NeonTitle as="h2" glow="cyan" size="lg" className="mb-2">
            {question.answer}
          </NeonTitle>
          <p className="text-muted-foreground">
            Question by <span className="text-secondary font-semibold">{questionMaster.name}</span>
          </p>
        </GlassCard>

        {/* Correct Guesses */}
        {correctGuessers.length > 0 ? (
          <GlassCard className="mb-6">
            <h3 className="font-display text-lg mb-4">Correct Guesses</h3>
            <div className="space-y-3">
              {correctGuessers.map((player, idx) => {
                const PositionIcon = POSITION_ICONS[idx] || Award;
                return (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl",
                      idx === 0
                        ? "bg-yellow-500/10 border border-yellow-500/30"
                        : idx === 1
                          ? "bg-gray-500/10 border border-gray-500/30"
                          : "bg-amber-600/10 border border-amber-600/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <PositionIcon className={cn("w-6 h-6", POSITION_COLORS[idx])} />
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <span className="text-neon-green font-bold">
                      +{POINTS_BY_POSITION[idx] || 0} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        ) : (
          <GlassCard glow="magenta" className="text-center mb-6">
            <NeonTitle as="h3" glow="magenta" size="md" className="mb-2">
              NO ONE GUESSED CORRECTLY!
            </NeonTitle>
            <p className="text-muted-foreground mb-2">
              <span className="text-secondary font-semibold">{questionMaster.name}</span> earns bonus points
            </p>
            <span className="text-neon-magenta font-bold text-xl">+10 pts</span>
          </GlassCard>
        )}

        {/* Current Standings */}
        <GlassCard className="mb-6">
          <h3 className="font-display text-lg mb-4">Current Standings</h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  idx === 0 ? "bg-primary/10" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold",
                    idx === 0 ? "bg-primary text-background" : "bg-muted"
                  )}>
                    {idx + 1}
                  </span>
                  <span className="font-medium">{player.name}</span>
                  {player.id === questionMaster.id && (
                    <span className="text-xs text-secondary">(QM)</span>
                  )}
                </div>
                <span className="font-bold text-primary">{player.score} pts</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Next Round Button */}
        <Button
          variant="neon"
          size="xl"
          onClick={onNextRound}
          className="w-full gap-2"
        >
          {roundNumber >= totalRounds ? "See Final Results" : "Next Round"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export { MultiplayerRoundResult };
