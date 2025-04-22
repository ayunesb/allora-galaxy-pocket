
import { useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Paintbrush, Moon, Sun } from "lucide-react";

const COLORS = ["indigo", "emerald", "rose", "slate", "violet", "amber"];

export default function ThemeCustomizer() {
  const { theme, themeColor, setTheme, updateThemeColor } = useTheme();
  const { toast } = useToast();
  const [color, setColor] = useState(themeColor);
  const [mode, setMode] = useState(theme);
  
  const handleSave = async () => {
    try {
      setTheme(mode);
      await updateThemeColor(color);
      
      toast({
        title: "Theme updated",
        description: "Your changes have been applied successfully"
      });
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
          <Label>Theme Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "light" ? "default" : "outline"}
              onClick={() => setMode("light")}
              className="flex items-center justify-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={mode === "dark" ? "default" : "outline"}
              onClick={() => setMode("dark")}
              className="flex items-center justify-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Apply Theme
        </Button>
      </CardContent>
    </Card>
  );
}
