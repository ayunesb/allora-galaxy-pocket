
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Shield } from "lucide-react";

export default function AutonomyToggle() {
  const [level, setLevel] = useState([1]);

  const autonomyLevels = ["Manual", "Semi-Auto", "Auto"];
  const currentLevel = autonomyLevels[Math.min(Math.floor(level[0] / 2), 2)];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base">AI Autonomy Level</Label>
        </div>
        <Slider
          max={5}
          step={1}
          value={level}
          onValueChange={setLevel}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Level {level} - {currentLevel}
        </p>
      </CardContent>
    </Card>
  );
}
