
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { tenantId } = await req.json();
    
    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: "Missing tenant ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get last week's date range
    const today = new Date();
    const lastWeekStart = new Date(today.setDate(today.getDate() - 7));
    lastWeekStart.setHours(0, 0, 0, 0);
    
    // Get the decisions from the last week
    const { data: decisions, error: decisionsError } = await supabase
      .from('strategies')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', lastWeekStart.toISOString());
      
    if (decisionsError) {
      throw decisionsError;
    }
    
    // Calculate metrics
    const totalDecisions = decisions?.length || 0;
    const aiApproved = decisions?.filter(d => d.auto_approved).length || 0;
    const aiApprovalRate = totalDecisions ? Math.round((aiApproved / totalDecisions) * 100) : 0;
    
    // Generate summary text
    let summaryText = `# Weekly AI Decision Summary\n\n`;
    summaryText += `For the week of ${lastWeekStart.toLocaleDateString()}\n\n`;
    
    if (totalDecisions > 0) {
      summaryText += `## Statistics\n`;
      summaryText += `- Total decisions: ${totalDecisions}\n`;
      summaryText += `- AI-approved decisions: ${aiApproved} (${aiApprovalRate}%)\n`;
      summaryText += `- Human-approved decisions: ${totalDecisions - aiApproved} (${100 - aiApprovalRate}%)\n\n`;
      
      summaryText += `## Top Strategy Types\n`;
      
      // Group by tags if available
      const tagCounts: Record<string, number> = {};
      decisions.forEach(d => {
        if (d.tags && Array.isArray(d.tags)) {
          d.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // Sort tags by count
      const sortedTags = Object.entries(tagCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);
      
      if (sortedTags.length > 0) {
        sortedTags.forEach(([tag, count]) => {
          summaryText += `- ${tag}: ${count} strategies\n`;
        });
      } else {
        summaryText += `No strategy categories identified this week.\n`;
      }
    } else {
      summaryText += `No decisions were made this week.\n`;
    }
    
    // Save the summary to the database
    const { data: summary, error: insertError } = await supabase
      .from('weekly_ai_summaries')
      .insert({
        tenant_id: tenantId,
        summary: summaryText,
        week_start: lastWeekStart.toISOString().split('T')[0],
        metadata: {
          total_decisions: totalDecisions,
          ai_approval_rate: aiApprovalRate
        }
      })
      .select()
      .single();
      
    if (insertError) {
      throw insertError;
    }
    
    // Log the action
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        event_type: 'WEEKLY_SUMMARY_GENERATED',
        message: `Generated weekly summary for week of ${lastWeekStart.toLocaleDateString()}`,
        meta: { totalDecisions, aiApprovalRate }
      });
    
    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
