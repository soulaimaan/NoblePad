-- Add milestones column to presales table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'presales' 
        AND column_name = 'milestones'
    ) THEN
        ALTER TABLE public.presales ADD COLUMN milestones JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN public.presales.milestones IS 'Project development milestones for fund release governance';
    END IF;
END $$;
