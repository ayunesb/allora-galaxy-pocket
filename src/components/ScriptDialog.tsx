
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, View } from "lucide-react";

interface ScriptDialogProps {
  label?: string;
  script: string;
  testConversation?: React.ReactNode;
  variant?: "ghost" | "default" | "secondary";
  buttonSize?: "sm" | "default" | "lg";
}

export function ScriptDialog({
  label = "View",
  script,
  testConversation,
  variant = "ghost",
  buttonSize = "sm"
}: ScriptDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={buttonSize}
          className="ml-2 gap-1"
          onClick={() => setOpen(true)}
        >
          <MessageSquare size={16} />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            {label}
          </DialogTitle>
        </DialogHeader>
        <div>
          <h4 className="font-semibold mb-1">Full Script</h4>
          <div className="bg-muted text-foreground p-3 rounded mb-4 whitespace-pre-wrap break-words overflow-x-auto max-w-full" style={{ wordBreak: "break-word" }}>
            {script}
          </div>
          {testConversation && (
            <>
              <h4 className="font-semibold mb-1">Test Conversation</h4>
              <div className="bg-background border rounded p-3 mb-2">
                {testConversation}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
