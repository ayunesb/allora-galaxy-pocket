
import { Card, CardContent } from "@/components/ui/card";
import { AgentCollabMessage } from "@/types/agent";

interface CollaborationListProps {
  messages: AgentCollabMessage[];
}

export default function CollaborationList({ messages }: CollaborationListProps) {
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <Card key={m.id}>
          <CardContent className="p-4">
            <div className="font-semibold">{m.agent}</div>
            <div className="text-sm mt-1">{m.message}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Session: {m.session_id}
              <span className="ml-2">
                {new Date(m.created_at).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
