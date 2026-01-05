-- Add estimator_id column to quotations table for tracking which estimator is assigned
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS estimator_id UUID REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quotations_estimator_id ON public.quotations(estimator_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);