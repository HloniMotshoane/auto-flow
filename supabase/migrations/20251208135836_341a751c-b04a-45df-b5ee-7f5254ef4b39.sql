-- Add logo_url column to car_makes table
ALTER TABLE public.car_makes ADD COLUMN IF NOT EXISTS logo_url text;