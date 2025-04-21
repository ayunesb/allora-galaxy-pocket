
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeadForm from "./LeadForm";
import LeadCard from "./LeadCard";
import { Lead, LeadStatus } from "@/types/lead";

const STAGES: LeadStatus[] = ["MQL", "SQL", "Closed"];

export default function LeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const advance = (id: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== id) return lead;
        const currentIndex = STAGES.indexOf(lead.status);
        return {
          ...lead,
          status: STAGES[currentIndex + 1] as LeadStatus
        };
      })
    );
  };

  const addLead = (newLead: Omit<Lead, "id" | "createdAt">) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setLeads((prev) => [...prev, lead]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-md mx-auto">
        <LeadForm onAdd={addLead} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STAGES.map((stage) => (
          <Card key={stage}>
            <CardHeader>
              <CardTitle className="text-lg">{stage}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads
                .filter((l) => l.status === stage)
                .map((lead) => (
                  <LeadCard 
                    key={lead.id} 
                    lead={lead} 
                    onAdvance={() => advance(lead.id)}
                    canAdvance={stage !== "Closed"}
                  />
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
