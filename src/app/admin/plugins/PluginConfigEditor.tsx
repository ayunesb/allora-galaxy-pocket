
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export type PluginConfig = Record<string, string>;

interface PluginConfigEditorProps {
  pluginKey: string;
  currentConfig?: PluginConfig;
  onSave: (pluginKey: string, config: PluginConfig) => Promise<void>;
}

export default function PluginConfigEditor({
  pluginKey,
  currentConfig = {},
  onSave
}: PluginConfigEditorProps) {
  const [form, setForm] = useState<PluginConfig>(currentConfig);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await onSave(pluginKey, form);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving plugin config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">⚙️ {pluginKey} Settings</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label htmlFor={key} className="text-sm font-medium text-gray-700">
              {key}
            </label>
            <Input
              id={key}
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={`Enter ${key}`}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
