
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StepGoal({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Primary Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <Input 
          placeholder="e.g. Increase MRR, Lower CAC..." 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
