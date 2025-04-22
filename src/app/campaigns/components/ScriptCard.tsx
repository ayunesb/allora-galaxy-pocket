
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface ScriptCardProps {
  channel: string;
  script: string;
}

export function ScriptCard({ channel, script }: ScriptCardProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp": return <MessageSquare size={16} />;
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-md capitalize flex items-center gap-2">
          {getChannelIcon(channel)} {channel.replace("_", " ")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">{script}</p>
      </CardContent>
    </Card>
  );
}
