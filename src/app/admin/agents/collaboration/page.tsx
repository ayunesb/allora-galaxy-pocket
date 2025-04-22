
'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentCollabMessage } from "@/types/agent";
import CollaborationList from "../components/CollaborationList";

export default function AgentCollabView() {
  const [messages, setMessages] = useState<AgentCollabMessage[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("agent_collaboration")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching agent collaborations:", error);
        return;
      }
      
      setMessages(data || []);
    };

    fetchMessages();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🤝 Agent Collaboration Log</h1>
      <CollaborationList messages={messages} />
    </div>
  );
}
