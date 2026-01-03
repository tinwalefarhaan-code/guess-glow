import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { ArrowLeft, Plus, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MultiplayerLobbyProps {
  onBack: () => void;
  onCreateRoom: (playerName: string) => Promise<string | null>;
  onJoinRoom: (code: string, playerName: string) => Promise<boolean>;
  isLoading?: boolean;
}

const MultiplayerLobby = ({ onBack, onCreateRoom, onJoinRoom, isLoading = false }: MultiplayerLobbyProps) => {
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    await onCreateRoom(playerName.trim());
  };

  const handleJoinRoom = async () => {
    if (roomCode.length < 4) {
      toast.error("Please enter a valid room code");
      return;
    }
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    await onJoinRoom(roomCode.toUpperCase(), playerName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "create" && playerName.trim()) {
        handleCreateRoom();
      } else if (mode === "join" && roomCode.length >= 4 && playerName.trim()) {
        handleJoinRoom();
      }
    }
  };

  if (mode === "create") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setMode("select")}
            className="mb-8 opacity-0 animate-fade-in"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center opacity-0 animate-fade-in stagger-1">
            <NeonTitle glow="magenta" size="lg" className="mb-4">
              CREATE ROOM
            </NeonTitle>
            <p className="text-muted-foreground mb-8">
              Enter your name to create a room
            </p>
          </div>

          <GlassCard className="mb-6 opacity-0 animate-scale-in stagger-2">
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Name
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your name"
              className="h-14 text-xl text-center font-display bg-transparent border-primary/30 focus-visible:border-primary"
              maxLength={20}
              autoFocus
              disabled={isLoading}
            />
          </GlassCard>

          <Button
            variant="neon"
            size="xl"
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || isLoading}
            className="w-full gap-2 opacity-0 animate-fade-in stagger-3"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isLoading ? "CREATING..." : "CREATE ROOM"}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setMode("select")}
            className="mb-8 opacity-0 animate-fade-in"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center opacity-0 animate-fade-in stagger-1">
            <NeonTitle glow="cyan" size="lg" className="mb-4">
              JOIN ROOM
            </NeonTitle>
            <p className="text-muted-foreground mb-8">
              Enter your name and room code
            </p>
          </div>

          <GlassCard className="mb-4 opacity-0 animate-scale-in stagger-2">
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Name
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your name"
              className="h-14 text-xl text-center font-display bg-transparent border-primary/30 focus-visible:border-primary"
              maxLength={20}
              autoFocus
              disabled={isLoading}
            />
          </GlassCard>

          <GlassCard className="mb-6 opacity-0 animate-scale-in stagger-2">
            <label className="text-sm text-muted-foreground mb-2 block">
              Room Code
            </label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="ENTER CODE"
              className="h-14 text-2xl text-center font-display tracking-[0.3em] bg-transparent border-primary/30 focus-visible:border-primary"
              maxLength={6}
              disabled={isLoading}
            />
          </GlassCard>

          <Button
            variant="neon"
            size="xl"
            onClick={handleJoinRoom}
            disabled={roomCode.length < 4 || !playerName.trim() || isLoading}
            className="w-full gap-2 opacity-0 animate-fade-in stagger-3"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoading ? "JOINING..." : "JOIN GAME"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 opacity-0 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-10 opacity-0 animate-fade-in stagger-1">
          <NeonTitle glow="gradient" size="lg" className="mb-3">
            MULTIPLAYER
          </NeonTitle>
          <p className="text-muted-foreground text-lg">
            Play with friends in real-time
          </p>
        </div>

        <div className="space-y-4">
          <GlassCard
            hover
            className="opacity-0 animate-slide-in-up stagger-2"
            onClick={() => setMode("create")}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-pink-400 flex items-center justify-center flex-shrink-0">
                <Plus className="w-7 h-7 text-background" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-display text-xl font-bold mb-1">CREATE ROOM</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new game and invite friends
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            hover
            className="opacity-0 animate-slide-in-up stagger-3"
            onClick={() => setMode("join")}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-7 h-7 text-background" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-display text-xl font-bold mb-1">JOIN ROOM</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a code to join an existing game
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <p className="text-center text-muted-foreground/60 text-xs mt-12 opacity-0 animate-fade-in stagger-4">
          2-6 players • Same question for all • Live scoreboard
        </p>
      </div>
    </div>
  );
};

export { MultiplayerLobby };
