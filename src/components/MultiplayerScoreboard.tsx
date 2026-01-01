import { Button } from "@/components/ui/button";
import { NeonTitle } from "@/components/NeonTitle";
import { GlassCard } from "@/components/GlassCard";
import { MultiplayerPlayer } from "@/hooks/useMultiplayerGame";
import { Home, RotateCcw, Share2, Trophy, Medal, Award, Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MultiplayerScoreboardProps {
  players: MultiplayerPlayer[];
  onPlayAgain: () => void;
  onHome: () => void;
  onBackToLobby?: () => void;
}

const POSITION_ICONS = [Trophy, Medal, Award];
const POSITION_COLORS = ["text-yellow-400", "text-gray-400", "text-amber-600"];
const POSITION_BG = [
  "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/40",
  "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/40",
  "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/40",
];

const MultiplayerScoreboard = ({
  players,
  onPlayAgain,
  onHome,
  onBackToLobby,
}: MultiplayerScoreboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const maxScore = winner?.score || 0;
  const winners = sortedPlayers.filter(p => p.score === maxScore);
  const isTie = winners.length > 1;

  const handleShare = async () => {
    const scoreText = sortedPlayers
      .map((p, i) => `${i + 1}. ${p.name}: ${p.score} pts`)
      .join("\n");
    
    const shareText = `🎭 Dumb Charades - Multiplayer Results!\n\n${
      isTie 
        ? `🏆 It's a tie between ${winners.map(w => w.name).join(" & ")}!`
        : `🏆 Winner: ${winner?.name || "Unknown"} with ${winner?.score || 0} points!`
    }\n\n${scoreText}\n\nPlay now at ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, "_blank");
      toast.success("Share via WhatsApp");
    }
  };

  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No players found</p>
          <Button variant="neon" onClick={onHome}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Winner Announcement */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <div className="absolute -inset-4 bg-yellow-400/20 blur-xl rounded-full" />
          </div>
          <NeonTitle glow="gradient" size="xl" className="mb-2">
            GAME OVER
          </NeonTitle>
          {isTie ? (
            <p className="text-xl text-muted-foreground">
              It's a tie! 🎉
            </p>
          ) : winner ? (
            <p className="text-xl">
              <span className="text-primary font-bold">{winner.name}</span>{" "}
              <span className="text-muted-foreground">wins!</span>
            </p>
          ) : null}
        </div>

        {/* Podium for top 3 */}
        {sortedPlayers.length >= 3 && (
          <div className="flex items-end justify-center gap-2 mb-8 h-48">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center mb-2 border-4 border-gray-400">
                <span className="font-display text-2xl text-background">2</span>
              </div>
              <p className="font-semibold text-sm truncate max-w-20">{sortedPlayers[1]?.name || "Player 2"}</p>
              <p className="text-primary font-bold">{sortedPlayers[1]?.score || 0}</p>
              <div className="w-20 h-24 bg-gray-400/30 rounded-t-lg mt-2" />
            </div>
            
            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-8">
              <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-2 border-4 border-yellow-300 animate-pulse">
                <span className="font-display text-3xl text-background">1</span>
              </div>
              <p className="font-bold truncate max-w-24">{sortedPlayers[0]?.name || "Player 1"}</p>
              <p className="text-primary font-bold text-lg">{sortedPlayers[0]?.score || 0}</p>
              <div className="w-24 h-32 bg-yellow-400/30 rounded-t-lg mt-2" />
            </div>
            
            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-2 border-4 border-amber-600">
                <span className="font-display text-2xl text-background">3</span>
              </div>
              <p className="font-semibold text-sm truncate max-w-20">{sortedPlayers[2]?.name || "Player 3"}</p>
              <p className="text-primary font-bold">{sortedPlayers[2]?.score || 0}</p>
              <div className="w-20 h-16 bg-amber-600/30 rounded-t-lg mt-2" />
            </div>
          </div>
        )}

        {/* Full Scoreboard */}
        <GlassCard className="mb-6">
          <h3 className="font-display text-lg mb-4">Final Standings</h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => {
              const PositionIcon = POSITION_ICONS[idx];
              return (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border",
                    idx < 3 ? POSITION_BG[idx] : "bg-muted/30 border-border/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {PositionIcon ? (
                      <PositionIcon className={cn("w-6 h-6", POSITION_COLORS[idx])} />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                    )}
                    <span className={cn(
                      "font-semibold",
                      idx === 0 && "text-lg"
                    )}>
                      {player.name}
                    </span>
                    {player.score === maxScore && idx > 0 && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        TIED
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "font-bold",
                    idx === 0 ? "text-xl text-primary" : "text-primary"
                  )}>
                    {player.score} pts
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="neon"
            size="xl"
            onClick={onPlayAgain}
            className="w-full gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="flex-1 gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Results
            </Button>
            {onBackToLobby && (
              <Button
                variant="outline"
                size="lg"
                onClick={onBackToLobby}
                className="flex-1 gap-2"
              >
                <Users className="w-5 h-5" />
                Back to Lobby
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onHome}
            className="w-full gap-2"
          >
            <Home className="w-5 h-5" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export { MultiplayerScoreboard };