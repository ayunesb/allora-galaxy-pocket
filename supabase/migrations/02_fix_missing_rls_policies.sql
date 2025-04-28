
-- Fix for agent_memory table
ALTER TABLE IF NOT EXISTS agent_memory ENABLE ROW LEVEL SECURITY;

-- Create policy for agent_memory
CREATE POLICY "Users can view their tenant's agent memories" 
ON agent_memory
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can insert agent memories for their tenant" 
ON agent_memory
FOR INSERT 
WITH CHECK (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can update agent memories for their tenant" 
ON agent_memory
FOR UPDATE
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Fix for agent_feedback table
ALTER TABLE IF NOT EXISTS agent_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for agent_feedback
CREATE POLICY "Users can view their tenant's agent feedback" 
ON agent_feedback
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can insert agent feedback for their tenant" 
ON agent_feedback
FOR INSERT 
WITH CHECK (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Fix for campaigns table
ALTER TABLE IF NOT EXISTS campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy for campaigns
CREATE POLICY "Users can view their tenant's campaigns" 
ON campaigns
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can insert campaigns for their tenant" 
ON campaigns
FOR INSERT 
WITH CHECK (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can update their tenant's campaigns" 
ON campaigns
FOR UPDATE
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can delete their tenant's campaigns" 
ON campaigns
FOR DELETE
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Fix for kpi_metrics table
ALTER TABLE IF NOT EXISTS kpi_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for kpi_metrics
CREATE POLICY "Users can view their tenant's KPI metrics" 
ON kpi_metrics
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can insert KPI metrics for their tenant" 
ON kpi_metrics
FOR INSERT 
WITH CHECK (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can update their tenant's KPI metrics" 
ON kpi_metrics
FOR UPDATE
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Create kpi_alerts table if it doesn't exist (referenced in code but missing in schema)
CREATE TABLE IF NOT EXISTS kpi_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  current_value NUMERIC,
  previous_value NUMERIC,
  target NUMERIC,
  threshold NUMERIC,
  percent_change NUMERIC,
  outcome TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tenant_id UUID NOT NULL,
  campaign_id UUID,
  metric TEXT,
  condition TEXT
);

-- Enable RLS on kpi_alerts
ALTER TABLE IF NOT EXISTS kpi_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for kpi_alerts
CREATE POLICY "Users can view their tenant's KPI alerts" 
ON kpi_alerts
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can insert KPI alerts for their tenant" 
ON kpi_alerts
FOR INSERT 
WITH CHECK (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Create kpi_alert_rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS kpi_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  kpi_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  threshold NUMERIC NOT NULL,
  compare_period TEXT NOT NULL,
  severity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  campaign_id UUID
);

-- Enable RLS on kpi_alert_rules
ALTER TABLE IF NOT EXISTS kpi_alert_rules ENABLE ROW LEVEL SECURITY;

-- Create policy for kpi_alert_rules
CREATE POLICY "Users can view their tenant's KPI alert rules" 
ON kpi_alert_rules
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can insert KPI alert rules for their tenant" 
ON kpi_alert_rules
FOR INSERT 
WITH CHECK (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

CREATE POLICY "Users can update their tenant's KPI alert rules" 
ON kpi_alert_rules
FOR UPDATE
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));
