import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface RoomPlayer {
  id: string;
  player_id: string;
  name: string;
  is_host: boolean;
  score: number;
  is_connected: boolean;
}

export interface Room {
  id: string;
  code: string;
  status: "waiting" | "playing" | "ended";
  host_id: string;
  game_state: Record<string, unknown>;
}

interface UseMultiplayerRoomResult {
  room: Room | null;
  players: RoomPlayer[];
  currentPlayerId: string;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  createRoom: (playerName: string) => Promise<string | null>;
  joinRoom: (code: string, playerName: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<boolean>;
  updateGameState: (gameState: Record<string, unknown>) => Promise<boolean>;
  updatePlayerScore: (playerId: string, score: number) => Promise<boolean>;
}

export const useMultiplayerRoom = (): UseMultiplayerRoomResult => {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [currentPlayerId] = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const roomChannelRef = useRef<RealtimeChannel | null>(null);
  const playersChannelRef = useRef<RealtimeChannel | null>(null);

  const isHost = room?.host_id === currentPlayerId;

  // Clean up subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }
    if (playersChannelRef.current) {
      supabase.removeChannel(playersChannelRef.current);
      playersChannelRef.current = null;
    }
  }, []);

  // Subscribe to room changes
  const subscribeToRoom = useCallback((roomId: string) => {
    cleanupSubscriptions();

    // Subscribe to room updates
    roomChannelRef.current = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Room update:", payload);
          if (payload.eventType === "UPDATE") {
            const newRoom = payload.new as Room;
            setRoom(newRoom);
          } else if (payload.eventType === "DELETE") {
            setRoom(null);
            setPlayers([]);
            toast.error("Room was closed");
          }
        }
      )
      .subscribe();

    // Subscribe to player updates
    playersChannelRef.current = supabase
      .channel(`room-players-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("Players update:", payload);
          // Refetch all players on any change
          const { data } = await supabase
            .from("room_players")
            .select("*")
            .eq("room_id", roomId)
            .order("joined_at", { ascending: true });
          
          if (data) {
            setPlayers(data as RoomPlayer[]);
          }
        }
      )
      .subscribe();
  }, [cleanupSubscriptions]);

  // Create a new room
  const createRoom = useCallback(async (playerName: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({
          code,
          host_id: currentPlayerId,
          status: "waiting",
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as first player
      const { error: playerError } = await supabase
        .from("room_players")
        .insert({
          room_id: roomData.id,
          player_id: currentPlayerId,
          name: playerName,
          is_host: true,
        });

      if (playerError) throw playerError;

      setRoom(roomData as Room);
      setPlayers([{
        id: roomData.id,
        player_id: currentPlayerId,
        name: playerName,
        is_host: true,
        score: 0,
        is_connected: true,
      }]);

      subscribeToRoom(roomData.id);
      return code;
    } catch (err) {
      console.error("Error creating room:", err);
      setError("Failed to create room");
      toast.error("Failed to create room");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentPlayerId, subscribeToRoom]);

  // Join an existing room
  const joinRoom = useCallback(async (code: string, playerName: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code.toUpperCase())
        .single();

      if (roomError || !roomData) {
        toast.error("Room not found");
        setError("Room not found");
        return false;
      }

      if (roomData.status !== "waiting") {
        toast.error("Game has already started");
        setError("Game has already started");
        return false;
      }

      // Check player count
      const { count } = await supabase
        .from("room_players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomData.id);

      if (count && count >= 6) {
        toast.error("Room is full (max 6 players)");
        setError("Room is full");
        return false;
      }

      // Check if player already exists
      const { data: existingPlayer } = await supabase
        .from("room_players")
        .select("*")
        .eq("room_id", roomData.id)
        .eq("player_id", currentPlayerId)
        .single();

      if (existingPlayer) {
        // Rejoin - update connection status
        await supabase
          .from("room_players")
          .update({ is_connected: true })
          .eq("room_id", roomData.id)
          .eq("player_id", currentPlayerId);
      } else {
        // Add new player
        const { error: playerError } = await supabase
          .from("room_players")
          .insert({
            room_id: roomData.id,
            player_id: currentPlayerId,
            name: playerName,
            is_host: false,
          });

        if (playerError) throw playerError;
      }

      // Fetch all players
      const { data: playersData } = await supabase
        .from("room_players")
        .select("*")
        .eq("room_id", roomData.id)
        .order("joined_at", { ascending: true });

      setRoom(roomData as Room);
      setPlayers((playersData || []) as RoomPlayer[]);
      subscribeToRoom(roomData.id);
      
      return true;
    } catch (err) {
      console.error("Error joining room:", err);
      setError("Failed to join room");
      toast.error("Failed to join room");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPlayerId, subscribeToRoom]);

  // Leave room
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!room) return;

    try {
      // Remove player from room
      await supabase
        .from("room_players")
        .delete()
        .eq("room_id", room.id)
        .eq("player_id", currentPlayerId);

      // If host leaves, delete room
      if (isHost) {
        await supabase.from("rooms").delete().eq("id", room.id);
      }

      cleanupSubscriptions();
      setRoom(null);
      setPlayers([]);
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  }, [room, currentPlayerId, isHost, cleanupSubscriptions]);

  // Start the game (host only)
  const startGame = useCallback(async (): Promise<boolean> => {
    if (!room || !isHost) return false;

    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status: "playing" })
        .eq("id", room.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error starting game:", err);
      toast.error("Failed to start game");
      return false;
    }
  }, [room, isHost]);

  // Update game state
  const updateGameState = useCallback(async (gameState: Record<string, unknown>): Promise<boolean> => {
    if (!room) return false;

    try {
      const { error } = await supabase
        .from("rooms")
        .update({ game_state: gameState as unknown as Record<string, never>, updated_at: new Date().toISOString() })
        .eq("id", room.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error updating game state:", err);
      return false;
    }
  }, [room]);

  // Update player score
  const updatePlayerScore = useCallback(async (playerId: string, score: number): Promise<boolean> => {
    if (!room) return false;

    try {
      const { error } = await supabase
        .from("room_players")
        .update({ score })
        .eq("room_id", room.id)
        .eq("player_id", playerId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error updating player score:", err);
      return false;
    }
  }, [room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscriptions();
    };
  }, [cleanupSubscriptions]);

  // Handle tab close / disconnect
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (room) {
        await supabase
          .from("room_players")
          .update({ is_connected: false })
          .eq("room_id", room.id)
          .eq("player_id", currentPlayerId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [room, currentPlayerId]);

  return {
    room,
    players,
    currentPlayerId,
    isHost,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateGameState,
    updatePlayerScore,
  };
};
