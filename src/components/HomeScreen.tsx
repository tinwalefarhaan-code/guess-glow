import { Button } from "@/components/ui/button";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { User, Users, Sparkles } from "lucide-react";

interface HomeScreenProps {
  onSinglePlayer: () => void;
  onMultiplayer: () => void;
}

const HomeScreen = ({ onSinglePlayer, onMultiplayer }: HomeScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center">
        {/* Logo/Title */}
        <div className="mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent animate-float">
            <Sparkles className="w-10 h-10 text-background" />
          </div>
          <NeonTitle glow="gradient" size="xl" className="mb-4">
            DUMB CHARADES
          </NeonTitle>
          <p className="text-muted-foreground text-lg">
            Guess the word from hints!
          </p>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <GlassCard
            hover
            className="opacity-0 animate-slide-in-up stagger-1"
            onClick={onSinglePlayer}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-background" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-display text-xl font-bold mb-1">SINGLE PLAYER</h3>
                <p className="text-sm text-muted-foreground">
                  Practice your guessing skills solo
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            hover
            className="opacity-0 animate-slide-in-up stagger-2"
            onClick={onMultiplayer}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-pink-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-background" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-display text-xl font-bold mb-1">MULTIPLAYER</h3>
                <p className="text-sm text-muted-foreground">
                  Compete with 2-6 players in real-time
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-muted-foreground/60 opacity-0 animate-fade-in stagger-3">
          No login required • Free to play
        </p>
      </div>
    </div>
  );
};

export { HomeScreen };
