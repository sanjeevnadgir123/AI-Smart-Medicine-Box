-- ==========================================
-- AI Smart Medicine Box v2
-- Table: public.dose_logs
-- ==========================================

-- 1. Create the dose_logs table
CREATE TABLE IF NOT EXISTS public.dose_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    taken_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
    compartment INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add Unique Constraint to prevent duplicate doses for the same medicine at the same time
-- This provides database-level protection against duplicates
ALTER TABLE public.dose_logs ADD CONSTRAINT unique_medicine_scheduled_time UNIQUE (medicine_id, scheduled_time);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- SELECT: Users can only see their own dose logs
CREATE POLICY "Users can view their own dose logs" 
ON public.dose_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own dose logs
CREATE POLICY "Users can insert their own dose logs" 
ON public.dose_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own dose logs
CREATE POLICY "Users can update their own dose logs" 
ON public.dose_logs 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own dose logs
CREATE POLICY "Users can delete their own dose logs" 
ON public.dose_logs 
FOR DELETE 
USING (auth.uid() = user_id);
