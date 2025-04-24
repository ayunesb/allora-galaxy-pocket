
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { 
      plugin_key, 
      operation, 
      config = {}, 
      data = {}, 
      strategy = null,
      tenant_id,
      user_id = null
    } = await req.json();
    
    if (!plugin_key || !operation || !tenant_id) {
      throw new Error("Missing required parameters: plugin_key, operation, and tenant_id");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Log plugin execution
    await supabase.from('system_logs').insert({
      tenant_id,
      user_id,
      event_type: 'PLUGIN_EXECUTION',
      message: `Executing plugin ${plugin_key} operation: ${operation}`,
      meta: { plugin_key, operation }
    });
    
    // Check if plugin is enabled
    const { data: pluginData, error: pluginError } = await supabase
      .from('tenant_plugins')
      .select('enabled')
      .eq('tenant_id', tenant_id)
      .eq('plugin_key', plugin_key)
      .single();
      
    if (pluginError || !pluginData?.enabled) {
      throw new Error(`Plugin ${plugin_key} is not enabled for this workspace`);
    }
    
    // Execute plugin operation
    let result;
    
    switch (plugin_key) {
      case 'analytics':
        result = await executeAnalyticsPlugin(operation, data, config, tenant_id);
        break;
        
      case 'email_marketing':
        result = await executeEmailPlugin(operation, data, config, tenant_id);
        break;
        
      case 'social_media':
        result = await executeSocialPlugin(operation, data, config, tenant_id);
        break;
        
      case 'integrations':
        result = await executeIntegrationsPlugin(operation, data, config, tenant_id);
        break;
        
      default:
        // For custom plugins, we'd load them dynamically
        result = await executeCustomPlugin(plugin_key, operation, data, config, tenant_id);
    }
    
    // Log success
    await supabase.from('plugin_usage_logs').insert({
      tenant_id,
      plugin_key,
      event: `${operation}_success`,
      event_type: 'execution'
    });
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error executing plugin:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Core plugin implementations
async function executeAnalyticsPlugin(operation: string, data: any, config: any, tenantId: string) {
  switch (operation) {
    case 'get_metrics':
      return {
        metrics: [
          { name: 'Page Views', value: 1250, trend: 'up' },
          { name: 'Conversions', value: 43, trend: 'up' },
          { name: 'Bounce Rate', value: '32%', trend: 'down' }
        ]
      };
      
    case 'generate_report':
      return {
        report_url: 'https://example.com/reports/analytics-2023Q4.pdf',
        summary: 'Traffic increased by 18% in the last month with a 5% improvement in conversion rate.'
      };
      
    default:
      throw new Error(`Unknown operation for analytics plugin: ${operation}`);
  }
}

async function executeEmailPlugin(operation: string, data: any, config: any, tenantId: string) {
  switch (operation) {
    case 'send_campaign':
      return {
        sent: true,
        recipients: 125,
        campaign_id: 'camp_' + Math.random().toString(36).substring(7)
      };
      
    case 'get_templates':
      return {
        templates: [
          { id: 'tmpl1', name: 'Welcome Email' },
          { id: 'tmpl2', name: 'Newsletter' },
          { id: 'tmpl3', name: 'Product Update' }
        ]
      };
      
    default:
      throw new Error(`Unknown operation for email plugin: ${operation}`);
  }
}

async function executeSocialPlugin(operation: string, data: any, config: any, tenantId: string) {
  switch (operation) {
    case 'schedule_post':
      return {
        scheduled: true,
        post_id: 'post_' + Math.random().toString(36).substring(7),
        scheduled_time: new Date(Date.now() + 86400000).toISOString()
      };
      
    case 'get_analytics':
      return {
        engagement: {
          likes: 342,
          shares: 87,
          comments: 54
        },
        reach: 12500,
        top_post: {
          id: 'post_abc123',
          content: 'Our new feature launch was a huge success!',
          engagement: 542
        }
      };
      
    default:
      throw new Error(`Unknown operation for social media plugin: ${operation}`);
  }
}

async function executeIntegrationsPlugin(operation: string, data: any, config: any, tenantId: string) {
  switch (operation) {
    case 'sync_crm':
      return {
        synced: true,
        records: 143,
        new_leads: 27
      };
      
    case 'get_connections':
      return {
        connections: [
          { id: 'conn1', type: 'crm', name: 'HubSpot', status: 'connected' },
          { id: 'conn2', type: 'helpdesk', name: 'Zendesk', status: 'connected' },
          { id: 'conn3', type: 'analytics', name: 'GA4', status: 'needs_reauth' }
        ]
      };
      
    default:
      throw new Error(`Unknown operation for integrations plugin: ${operation}`);
  }
}

// For custom plugins
async function executeCustomPlugin(pluginKey: string, operation: string, data: any, config: any, tenantId: string) {
  // This would normally load the plugin code dynamically from a registry
  // For now, we'll just return a mock response
  return {
    success: true,
    plugin: pluginKey,
    operation: operation,
    result: {
      message: `Custom plugin ${pluginKey} executed operation ${operation} successfully`,
      timestamp: new Date().toISOString()
    }
  };
}
