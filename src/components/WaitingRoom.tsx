import { Button } from "@/components/ui/button";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { ArrowLeft, Copy, Check, Users, Crown, Play, Loader2, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RoomPlayer, Room } from "@/hooks/useMultiplayerRoom";

interface WaitingRoomProps {
  room: Room;
  players: RoomPlayer[];
  currentPlayerId: string;
  isHost: boolean;
  isLoading: boolean;
  onBack: () => void;
  onStartGame: () => Promise<boolean>;
}

const WaitingRoom = ({ 
  room, 
  players, 
  currentPlayerId,
  isHost, 
  isLoading,
  onBack, 
  onStartGame 
}: WaitingRoomProps) => {
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    const success = await onStartGame();
    if (!success) {
      setIsStarting(false);
    }
  };

  const connectedPlayers = players.filter(p => p.is_connected);
  const canStartGame = connectedPlayers.length >= 2;
  const hostPlayer = players.find(p => p.is_host);
  const hostDisconnected = hostPlayer && !hostPlayer.is_connected;

  // Check if current player is in the room
  const currentPlayer = players.find(p => p.player_id === currentPlayerId);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 opacity-0 animate-fade-in"
          disabled={isLoading || isStarting}
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
              {room.code}
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

        {hostDisconnected && (
          <GlassCard className="mb-4 border-destructive/50 bg-destructive/10 opacity-0 animate-fade-in stagger-2">
            <div className="flex items-center gap-3 text-destructive">
              <WifiOff className="w-5 h-5" />
              <p className="text-sm">Host disconnected. Game cannot start.</p>
            </div>
          </GlassCard>
        )}

        <GlassCard className="mb-6 opacity-0 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Players</span>
            <span className="font-display text-primary">{connectedPlayers.length}/6</span>
          </div>
          <div className="space-y-3">
            {players.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading players...</p>
              </div>
            ) : (
              players.map((player) => (
                <div
                  key={player.player_id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-opacity ${
                    player.is_connected ? "bg-muted/30" : "bg-muted/10 opacity-50"
                  } ${player.player_id === currentPlayerId ? "ring-2 ring-primary/50" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    player.is_host 
                      ? "bg-gradient-to-br from-secondary to-pink-400" 
                      : "bg-gradient-to-br from-primary to-cyan-400"
                  }`}>
                    {player.is_host ? (
                      <Crown className="w-5 h-5 text-background" />
                    ) : (
                      <Users className="w-5 h-5 text-background" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {player.name}
                      {player.player_id === currentPlayerId && (
                        <span className="text-primary ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player.is_host ? "Host" : "Player"}
                      {!player.is_connected && " • Disconnected"}
                    </p>
                  </div>
                  {!player.is_connected && (
                    <WifiOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {isHost && (
          <Button
            variant="neon"
            size="xl"
            onClick={handleStartGame}
            disabled={!canStartGame || isStarting}
            className="w-full gap-2 opacity-0 animate-fade-in stagger-4"
          >
            {isStarting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {isStarting ? "STARTING..." : "START GAME"}
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
              <span className="text-sm text-muted-foreground">
                Waiting for {hostPlayer?.name || "host"} to start...
              </span>
            </div>
          </div>
        )}

        <p className="text-center text-muted-foreground/50 text-xs mt-8 opacity-0 animate-fade-in stagger-4">
          Room syncs in real-time across all devices
        </p>
      </div>
    </div>
  );
};

export { WaitingRoom };
