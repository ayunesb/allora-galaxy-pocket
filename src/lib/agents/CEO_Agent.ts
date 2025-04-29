
import { supabase } from '@/integrations/supabase/client';

export interface AgentFeedback {
  agent: string;
  tenant_id: string;
  feedback?: string;
  rating?: number;
  type?: string;
  task_id?: string;
}

export class CEOAgent {
  private tenantId: string;
  
  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async generateStrategy(industry: string, goals: string[], painPoints: string[]) {
    try {
      // Mock strategy generation for now
      const strategy = {
        title: `Growth Strategy for ${industry}`,
        description: `Strategic plan focusing on ${goals.join(', ')} while addressing ${painPoints.join(', ')}`,
        steps: [
          "Identify target audience segments",
          "Develop tailored messaging for each segment",
          "Launch multi-channel campaign",
          "Measure and optimize performance"
        ]
      };

      // Store in the database
      const { data, error } = await supabase
        .from('strategies')
        .insert({
          tenant_id: this.tenantId,
          title: strategy.title,
          description: strategy.description,
          generated_by: 'CEO Agent',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, strategy: data };
    } catch (error) {
      console.error('CEO Agent strategy generation error:', error);
      return { success: false, error };
    }
  }

  async provideFeedback(feedback: AgentFeedback) {
    try {
      // Make sure we have tenant_id in the feedback
      const feedbackWithTenant = {
        ...feedback,
        tenant_id: this.tenantId
      };
      
      const { data, error } = await supabase
        .from('agent_feedback')
        .insert(feedbackWithTenant)
        .select()
        .single();

      if (error) throw error;

      return { success: true, feedback: data };
    } catch (error) {
      console.error('CEO Agent feedback submission error:', error);
      return { success: false, error };
    }
  }

  async getStrategicInsights() {
    try {
      const { data, error } = await supabase
        .from('kpi_insights')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return { success: true, insights: data };
    } catch (error) {
      console.error('Failed to get strategic insights:', error);
      return { success: false, error };
    }
  }
}

export default CEOAgent;
