import { Button } from "@/components/ui/button";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { ArrowLeft, Copy, Check, Users, Crown, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface WaitingRoomProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onBack: () => void;
  onStartGame: () => void;
}

const WaitingRoom = ({ roomCode, players, isHost, onBack, onStartGame }: WaitingRoomProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const canStartGame = players.length >= 2;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 opacity-0 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave Room
        </Button>

        <div className="text-center opacity-0 animate-fade-in stagger-1">
          <NeonTitle glow="gradient" size="lg" className="mb-4">
            WAITING ROOM
          </NeonTitle>
          <p className="text-muted-foreground mb-8">
            {isHost ? "Share the code and start when ready" : "Waiting for host to start..."}
          </p>
        </div>

        <GlassCard glow="cyan" className="text-center mb-6 opacity-0 animate-scale-in stagger-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Room Code
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="font-display text-4xl md:text-5xl font-bold text-primary neon-text-cyan tracking-[0.3em]">
              {roomCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyCode}
              className="h-12 w-12"
            >
              {copied ? (
                <Check className="w-5 h-5 text-neon-green" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="mb-6 opacity-0 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Players</span>
            <span className="font-display text-primary">{players.length}/6</span>
          </div>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  player.isHost 
                    ? "bg-gradient-to-br from-secondary to-pink-400" 
                    : "bg-gradient-to-br from-primary to-cyan-400"
                }`}>
                  {player.isHost ? (
                    <Crown className="w-5 h-5 text-background" />
                  ) : (
                    <Users className="w-5 h-5 text-background" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.isHost ? "Host" : "Player"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {isHost && (
          <Button
            variant="neon"
            size="xl"
            onClick={onStartGame}
            disabled={!canStartGame}
            className="w-full gap-2 opacity-0 animate-fade-in stagger-4"
          >
            <Play className="w-5 h-5" />
            START GAME
          </Button>
        )}

        {isHost && !canStartGame && (
          <p className="text-center text-muted-foreground text-sm mt-4 opacity-0 animate-fade-in stagger-4">
            Need at least 2 players to start
          </p>
        )}

        {!isHost && (
          <div className="text-center opacity-0 animate-fade-in stagger-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-sm text-muted-foreground">Waiting for host to start...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { WaitingRoom };
