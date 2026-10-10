-- ==========================================
-- AI Smart Medicine Box v2 - Phase 2B Schema
-- Table: public.medicines
-- ==========================================

-- 1. Create the medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dose TEXT NOT NULL,
    time TIME NOT NULL,
    compartment INTEGER NOT NULL CHECK (compartment >= 1 AND compartment <= 8),
    repeat TEXT NOT NULL DEFAULT 'daily' CHECK (repeat IN ('once', 'daily', 'weekdays', 'custom')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger for the medicines table
DROP TRIGGER IF EXISTS set_medicines_updated_at ON public.medicines;
CREATE TRIGGER set_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- SELECT: Users can only see their own medicines
CREATE POLICY "Users can view their own medicines" 
ON public.medicines 
FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own medicines
CREATE POLICY "Users can insert their own medicines" 
ON public.medicines 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own medicines
CREATE POLICY "Users can update their own medicines" 
ON public.medicines 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own medicines
CREATE POLICY "Users can delete their own medicines" 
ON public.medicines 
FOR DELETE 
USING (auth.uid() = user_id);
