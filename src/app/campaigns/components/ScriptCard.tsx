
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface ScriptCardProps {
  channel: string;
  script: string;
}

export function ScriptCard({ channel, script }: ScriptCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<"approved" | "rejected" | null>(null);

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

  // Helper to simulate a short "test conversation" for each channel
  const getTestConversation = (channel: string, script: string) => {
    switch (channel) {
      case "whatsapp":
        return (
          <div className="space-y-2">
            <div>
              <span className="font-bold text-green-700">You:</span> {script.replace("{{first_name}}", "Taylor")}
            </div>
            <div>
              <span className="font-bold text-gray-600">Taylor:</span> "Sounds interesting! Tell me more?"
            </div>
          </div>
        );
      case "email":
        return (
          <div className="space-y-2">
            <div>
              <span className="font-bold text-primary">To: Taylor</span>
              <pre className="bg-muted rounded p-2 mt-1">{script}</pre>
            </div>
            <div>
              <span className="font-bold text-gray-600">Taylor:</span> "Thanks for reaching out! Can you send more details?"
            </div>
          </div>
        );
      case "tiktok":
        return (
          <div>
            <span className="font-bold text-purple-700">Video Script:</span>
            <pre className="bg-muted rounded p-2 mt-1">{script}</pre>
          </div>
        );
      case "meta":
        return (
          <div>
            <span className="font-bold text-blue-700">Meta Ad Carousel:</span>
            <pre className="bg-muted rounded p-2 mt-1">{script}</pre>
          </div>
        );
      case "cold_call":
        return (
          <div className="space-y-2">
            <div>
              <span className="font-bold text-orange-700">You (cold call):</span> {script}
            </div>
            <div>
              <span className="font-bold text-gray-600">Prospect:</span> "I'm intrigued, but busy. Can you send more info?"
            </div>
          </div>
        );
      case "warm_call":
        return (
          <div className="space-y-2">
            <div>
              <span className="font-bold text-amber-700">You (warm call):</span> {script}
            </div>
            <div>
              <span className="font-bold text-gray-600">Prospect:</span> "Yes, please share the details with me."
            </div>
          </div>
        );
      case "zoom":
        return (
          <div>
            <span className="font-bold text-blue-600">Zoom Training:</span>
            <pre className="bg-muted rounded p-2 mt-1">{script}</pre>
          </div>
        );
      default:
        return (
          <pre className="bg-muted rounded p-2 mt-1">{script}</pre>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <CardTitle
              className="text-md capitalize flex items-center gap-2 cursor-pointer hover:underline"
              title="View full strategy and test conversation"
              onClick={() => setDialogOpen(true)}
            >
              {getChannelIcon(channel)} {channel.replace("_", " ")}
            </CardTitle>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {getChannelIcon(channel)} {channel.replace("_", " ")} Strategy
              </DialogTitle>
              <DialogDescription>
                This is the full AI-generated strategy for <b>{channel.replace("_", " ")}</b>.
              </DialogDescription>
            </DialogHeader>
            <div>
              <h4 className="font-semibold mb-1">Copy-able Script</h4>
              <div className="bg-muted text-foreground p-3 rounded mb-4 whitespace-pre-wrap break-words">
                {script}
              </div>
              <h4 className="font-semibold mb-1">Test Conversation</h4>
              <div className="bg-background border rounded p-3 mb-2">{getTestConversation(channel, script)}</div>
            </div>
            <DialogFooter>
              <Button
                variant={status === "approved" ? "default" : "outline"}
                onClick={() => setStatus("approved")}
              >
                {status === "approved" ? "Approved" : "Approve"}
              </Button>
              <Button
                variant={status === "rejected" ? "destructive" : "outline"}
                onClick={() => setStatus("rejected")}
              >
                {status === "rejected" ? "Rejected" : "Reject"}
              </Button>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
            {status && (
              <div className={`mt-3 text-sm ${status === "approved" ? "text-green-600" : "text-red-600"}`}>
                {status === "approved"
                  ? "You have approved this strategy."
                  : "You have rejected this strategy."}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">{script}</p>
      </CardContent>
    </Card>
  );
}
