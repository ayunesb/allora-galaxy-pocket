import React from "react";
import { ScriptDialog } from "@/components/ScriptDialog";

interface StrategyPreviewProps {
  id: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  tenant_id: string | null;
}

const getTestConversation = (description: string) => (
  <div>
    <span className="font-bold text-blue-600">AI User:</span> &quot;{description.slice(0, 60)}...&quot;<br />
    <span className="font-bold text-gray-600">You:</span> &quot;How does this help me launch?&quot;
  </div>
);

export default function StrategyPreview(props: StrategyPreviewProps) {
  const { strategy } = props;

  return (
    <div className="rounded-xl bg-card p-6 border shadow-md flex flex-col min-h-[180px]">
      <div className="flex items-center mb-2">
        <h2 className="text-xl font-semibold flex-1">{props.title}</h2>
        <ScriptDialog
          script={props.description}
          testConversation={getTestConversation(props.description)}
        />
      </div>
      <div className="text-muted-foreground mb-1">{props.created_at && (new Date(props.created_at)).toLocaleString()}</div>
      <div className="text-base">{props.description}</div>
    </div>
  );
}
