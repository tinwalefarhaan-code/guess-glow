-- Create rooms table for multiplayer games
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'ended')),
  host_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  game_state JSONB DEFAULT '{}'::jsonb
);

-- Create room_players table for players in each room
CREATE TABLE public.room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, player_id)
);

-- Enable RLS on both tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (public game)
CREATE POLICY "Anyone can view rooms"
ON public.rooms
FOR SELECT
USING (true);

-- Allow anyone to create rooms
CREATE POLICY "Anyone can create rooms"
ON public.rooms
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update rooms (for game state changes)
CREATE POLICY "Anyone can update rooms"
ON public.rooms
FOR UPDATE
USING (true);

-- Allow anyone to view room players
CREATE POLICY "Anyone can view room players"
ON public.room_players
FOR SELECT
USING (true);

-- Allow anyone to join rooms
CREATE POLICY "Anyone can join rooms"
ON public.room_players
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their player status
CREATE POLICY "Anyone can update room players"
ON public.room_players
FOR UPDATE
USING (true);

-- Allow anyone to leave rooms
CREATE POLICY "Anyone can leave rooms"
ON public.room_players
FOR DELETE
USING (true);

-- Create index for quick room lookup by code
CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_room_players_room_id ON public.room_players(room_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;