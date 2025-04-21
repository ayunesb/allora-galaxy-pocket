
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/lead";

interface LeadCardProps {
  lead: Lead;
  onAdvance: () => void;
  canAdvance: boolean;
}

export default function LeadCard({ lead, onAdvance, canAdvance }: LeadCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <p className="font-semibold">{lead.name}</p>
        <p className="text-sm text-muted-foreground">{lead.email}</p>
        {canAdvance && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAdvance} 
            className="w-full mt-2"
          >
            Move to next stage
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
