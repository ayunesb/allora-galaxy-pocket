
import React from "react";
import { diffWords } from "diff";

export default function PromptDiff({ oldPrompt, newPrompt }: { oldPrompt: string; newPrompt: string }) {
  const diff = diffWords(oldPrompt, newPrompt);
  return (
    <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap leading-snug mb-2">
      {diff.map((part, i) => (
        <span
          key={i}
          className={
            part.added
              ? "bg-green-100"
              : part.removed
              ? "bg-red-100 line-through"
              : ""
          }
        >
          {part.value}
        </span>
      ))}
    </pre>
  );
}
