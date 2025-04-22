
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScriptCardProps {
  channel: string;
  script: string;
}

export function ScriptCard({ channel, script }: ScriptCardProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp": return "📲";
      case "email": return "📧";
      case "tiktok": return "🎥";
      case "meta": return "📱";
      case "cold_call": return "📞";
      case "warm_call": return "☎️";
      case "zoom": return "📅";
      default: return "📝";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md capitalize flex items-center gap-2">
          {getChannelIcon(channel)} {channel.replace("_", " ")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{script}</p>
      </CardContent>
    </Card>
  );
}
