
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

interface AgentProfileProps {
  name: string;
  specialty: string;
  xp: number;
}

const AgentProfile = ({ name, specialty, xp }: AgentProfileProps) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Specialty: {specialty}</p>
        <p className="text-xs text-muted-foreground/80 mt-1">XP: {xp}</p>
      </CardContent>
    </Card>
  );
};

export default AgentProfile;
