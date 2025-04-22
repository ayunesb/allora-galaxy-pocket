
import { supabase } from "@/integrations/supabase/client";
import { logAgentCollaboration } from './agentCollaboration';
import { logAgentMemory } from './memoryLogger';

interface MeetingParams {
  topic: string;
  start_time: string;
  duration: number;
}

export class ZoomAgent {
  private sessionId: string;
  private tenantId: string;

  constructor(tenantId: string) {
    this.sessionId = crypto.randomUUID();
    this.tenantId = tenantId;
  }

  async scheduleMeeting({ topic, start_time, duration }: MeetingParams) {
    try {
      // First log the attempt
      await logAgentCollaboration({
        sessionId: this.sessionId,
        agent: 'Zoom',
        message: `Scheduling meeting: ${topic}`,
        tenantId: this.tenantId
      });

      const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_ZOOM_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic,
          type: 2, // Scheduled meeting
          start_time,
          duration,
          settings: {
            join_before_host: true,
            approval_type: 0
          }
        })
      });

      const data = await response.json();

      // Log success to agent memory
      await logAgentMemory({
        tenantId: this.tenantId,
        agentName: 'Zoom',
        context: `Successfully scheduled meeting: ${topic}`,
        type: 'history'
      });

      return data;
    } catch (error) {
      console.error('ZoomAgent scheduling error:', error);
      
      // Log failure
      await logAgentCollaboration({
        sessionId: this.sessionId,
        agent: 'Zoom',
        message: `Failed to schedule meeting: ${error.message}`,
        tenantId: this.tenantId
      });

      throw error;
    }
  }

  async getMeetings() {
    try {
      const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_ZOOM_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('ZoomAgent get meetings error:', error);
      throw error;
    }
  }
}

