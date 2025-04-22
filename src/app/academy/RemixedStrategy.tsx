import React from "react";
import { ScriptDialog } from "@/components/ScriptDialog";

interface RemixedStrategyProps {
  title: string;
  author: string;
  onUse: () => void;
}

export default function RemixedStrategy({ title, author, onUse }: RemixedStrategyProps) {
  const script = `Strategy: ${title}\nRemixed by ${author}`;
  const conversation = (
    <div>
      <b>User:</b> "What’s unique about this strategy?"<br />
      <b>{author}:</b> "It's tailored for you! Let’s get started."
    </div>
  );

  return (
    <div className="border rounded-lg bg-background p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <b>{title}</b> <span className="ml-2 text-xs text-muted-foreground">by {author}</span>
        </div>
        <ScriptDialog script={script} testConversation={conversation} variant="ghost" buttonSize="sm" />
      </div>
      <button
        className="bg-secondary text-sm px-3 py-1 rounded hover:bg-secondary/90 mt-2"
        onClick={onUse}
      >
        Use Strategy
      </button>
    </div>
  );
}
