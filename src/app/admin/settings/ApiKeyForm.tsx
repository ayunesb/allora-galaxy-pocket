
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";

interface ApiKeyFormProps {
  label: string;
  placeholder: string;
  onSave: (value: string) => void;
}

export default function ApiKeyForm({ label, placeholder, onSave }: ApiKeyFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base">{label}</Label>
        </div>
        <Input
          type="password"
          placeholder={placeholder}
          onBlur={(e) => onSave(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
