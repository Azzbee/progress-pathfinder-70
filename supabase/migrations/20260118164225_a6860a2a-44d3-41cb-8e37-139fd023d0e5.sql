-- Add theme column to user_settings table
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'softer';