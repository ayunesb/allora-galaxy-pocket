
-- Create tables for strategy versioning and feedback
CREATE TABLE IF NOT EXISTS public.strategy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    strategy_id UUID NOT NULL,
    version INTEGER NOT NULL,
    changes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strategy_versions ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Users can view their tenant's strategy versions" 
ON public.strategy_versions
FOR SELECT 
USING (auth.uid() IS NOT NULL AND tenant_id IN (
    SELECT tenant_id FROM tenant_user_roles WHERE user_id = auth.uid()
));

-- Create policy for insert access
CREATE POLICY "Users can insert strategy versions for their tenant" 
ON public.strategy_versions
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND tenant_id IN (
    SELECT tenant_id FROM tenant_user_roles WHERE user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strategy_versions_strategy_id
ON strategy_versions(strategy_id);

CREATE INDEX IF NOT EXISTS idx_strategy_versions_tenant_id
ON strategy_versions(tenant_id);

-- Add metrics_baseline column to strategies if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'strategies' 
        AND column_name = 'metrics_baseline'
    ) THEN
        ALTER TABLE strategies 
        ADD COLUMN metrics_baseline JSONB DEFAULT '{}'::jsonb;
    END IF;
END$$;
