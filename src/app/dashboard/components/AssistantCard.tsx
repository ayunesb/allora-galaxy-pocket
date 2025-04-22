
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AssistantCard() {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Assistant</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Need to send an email, generate a post, or book a call?
        </p>
        <Button
          variant="link"
          className="mt-2 h-auto p-0"
          onClick={() => navigate("/assistant")}
        >
          Open AI Assistant →
        </Button>
      </CardContent>
    </Card>
  );
}
