
import { useAuth } from "@/hooks/useAuth";
import { usePersona } from "@/hooks/usePersona";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PersonaEditor() {
  const { user } = useAuth();
  const { persona, updatePersona, isLoading } = usePersona(user?.id || "");

  if (!user) return null;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Persona Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Industry</label>
          <Input
            value={persona.industry}
            onChange={(e) => updatePersona({ industry: e.target.value })}
            placeholder="Your industry"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Goal</label>
          <Textarea
            value={persona.goal}
            onChange={(e) => updatePersona({ goal: e.target.value })}
            placeholder="Your main business goal"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Communication Tone</label>
          <Select
            value={persona.tone}
            onValueChange={(value) => 
              updatePersona({ 
                tone: value as "professional" | "casual" | "inspirational" | "technical" 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="inspirational">Inspirational</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
