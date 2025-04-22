
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";

const COLORS = ["indigo", "emerald", "rose", "gray", "yellow", "cyan"];
const MODES = ["light", "dark"];

export default function ThemeCustomizer() {
  const { themeColor, themeMode, updateTheme } = useTheme();
  const { toast } = useToast();
  const [color, setColor] = useState(themeColor);
  const [mode, setMode] = useState(themeMode);
  
  const handleSave = async () => {
    try {
      await updateTheme(color, mode);
      toast({
        title: "Theme updated",
        description: "Your changes will take effect immediately"
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Paintbrush className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Theme Customizer</h2>
        </div>

        <div className="space-y-2">
          <Label>Primary Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Default Mode</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m} value={m} className="capitalize">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Theme
        </Button>
      </CardContent>
    </Card>
  );
}
