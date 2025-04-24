
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const checkTableRlsStatus = async (tableName: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Check if the table has RLS enabled
    const { data: rlsCheck, error: rlsError } = await supabase
      .rpc("check_table_rls_status", { table_name: tableName });
      
    if (rlsError) throw rlsError;
    
    const isRlsEnabled = rlsCheck?.[0]?.has_rls || false;
    const hasTenantId = rlsCheck?.[0]?.has_tenant_id || false;
    const hasAuthPolicy = rlsCheck?.[0]?.has_auth_policy || false;
    
    // Get policy details if RLS is enabled
    let policies = [];
    if (isRlsEnabled) {
      const { data: policyData, error: policyError } = await supabase
        .from("pg_policies")
        .select("*")
        .eq("tablename", tableName)
        .eq("schemaname", "public");
        
      if (policyError) throw policyError;
      policies = policyData || [];
    }
    
    return {
      table: tableName,
      rlsEnabled: isRlsEnabled,
      hasTenantId,
      hasAuthPolicy,
      policies,
      securityScore: getSecurityScore(isRlsEnabled, hasTenantId, hasAuthPolicy)
    };
  } catch (err) {
    console.error(`Error checking RLS status for ${tableName}:`, err);
    return {
      table: tableName,
      rlsEnabled: false,
      hasTenantId: false,
      hasAuthPolicy: false,
      policies: [],
      securityScore: 0,
      error: err.message
    };
  }
};

const getSecurityScore = (
  hasRls: boolean, 
  hasTenantId: boolean, 
  hasAuthPolicy: boolean
): number => {
  let score = 0;
  if (hasRls) score += 40;
  if (hasTenantId) score += 20;
  if (hasAuthPolicy) score += 40;
  return score;
};

export const validateAllTables = async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) throw tablesError;
    
    // Check each table for RLS status
    const results = [];
    for (const table of tables) {
      const status = await checkTableRlsStatus(table.tablename);
      results.push(status);
    }
    
    return results;
  } catch (err) {
    console.error("Error validating tables:", err);
    return { error: err.message };
  }
};
