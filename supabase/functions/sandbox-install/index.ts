
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenant_id, plugin_submission_id, schema_sql } = await req.json();
    
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a record of this sandbox attempt
    const { data: sandboxInstall, error: sandboxError } = await supabaseClient
      .from('plugin_sandbox_installs')
      .insert({
        tenant_id,
        plugin_submission_id,
        schema_run: false,
        preview_success: false
      })
      .select()
      .single();

    if (sandboxError) {
      throw new Error(`Failed to create sandbox install record: ${sandboxError.message}`);
    }

    // Execute SQL in a safe transaction that can be rolled back
    // Note: In a production environment, this should be executed in an isolated schema
    const sql = `
      DO $$
      BEGIN
        -- Start transaction that can be rolled back
        BEGIN
          ${schema_sql}
        EXCEPTION WHEN OTHERS THEN
          -- If any error occurs, the transaction will be rolled back
          RAISE EXCEPTION 'Schema installation failed: %', SQLERRM;
        END;
      END $$;
    `;

    // Execute the SQL using RPC or a direct connection
    const { error: sqlError } = await supabaseClient.rpc('execute_sql', { 
      sql_query: sql 
    });

    // Update the sandbox install record with the results
    await supabaseClient
      .from('plugin_sandbox_installs')
      .update({
        schema_run: sqlError ? false : true,
        preview_success: sqlError ? false : true,
        tested_at: new Date().toISOString()
      })
      .eq('id', sandboxInstall.id);

    return new Response(
      JSON.stringify({
        success: !sqlError,
        message: sqlError ? sqlError.message : 'Schema installed successfully in sandbox environment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: sqlError ? 400 : 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Error in sandbox installation: ${error.message}` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
