
import React from "react";
import { ScriptDialog } from "@/components/ScriptDialog";
import type { Strategy } from "@/types/strategy";

interface StrategyPreviewProps {
  id: string;
  title: string;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  tenant_id: string | null;
  industry?: string | null;
  goal?: string | null;
  confidence?: string | null;
  status?: string | null;
}

/**
 * Returns a ReactNode that simulates a conversation about how the AI created the strategy.
 */
const getAICreationConversation = (strategy: Strategy) => (
  <div>
    <span className="font-bold text-blue-600">AI Bot:</span> "To generate this strategy, I analyzed your industry {strategy.industry ?? "(unspecified)"} and primary goal: '{strategy.goal ?? strategy.goals?.[0] ?? "N/A"}'. I pulled best practices and recent success trends, then tailored an actionable plan to your use case."<br />
    <span className="font-bold text-gray-600">You:</span> "Why is this approach recommended?"<br />
    <span className="font-bold text-blue-600">AI Bot:</span> "It leverages fast follow-ups and automation, which have proven to increase conversion, especially for {strategy.industry ?? "your industry"}. Speed and personalization are key factors in high-performing campaigns."
  </div>
);

export default function StrategyPreview(props: StrategyPreviewProps) {
  const {
    title,
    description,
    created_at,
    updated_at,
    industry,
    goal,
    confidence,
    status
  } = props;

  // Prepare the full script details for the dialog.
  const fullStrategyInfo = [
    `Title: ${title}`,
    description ? `Description: ${description}` : null,
    industry ? `Industry: ${industry}` : null,
    goal ? `Goal: ${goal}` : null,
    confidence ? `AI Confidence: ${confidence}` : null,
    status ? `Status: ${status}` : null,
    created_at ? `Created at: ${new Date(created_at).toLocaleString()}` : null
  ]
    .filter(Boolean)
    .join("\n");

  // Determine valid strategy status or default to 'draft'
  const strategyStatus: Strategy['status'] = 
    (status === 'draft' || status === 'pending' || status === 'approved' || status === 'rejected') 
      ? status as Strategy['status'] 
      : 'draft';

  // For AI creation explanation, pass all available props in a Strategy object
  const testConversation = getAICreationConversation({
    id: props.id,
    title,
    description: description || '',
    created_at: created_at || '',
    updated_at,
    tenant_id: props.tenant_id || undefined,
    industry,
    goal,
    confidence,
    status: strategyStatus
  });

  return (
    <div className="rounded-xl bg-card p-6 border shadow-md flex flex-col min-h-[180px]">
      <div className="flex items-center mb-2">
        <h2 className="text-xl font-semibold flex-1">{title}</h2>
        <ScriptDialog
          label="View"
          script={fullStrategyInfo}
          testConversation={testConversation}
          variant="ghost"
          buttonSize="sm"
        />
      </div>
      <div className="text-muted-foreground mb-1">
        {created_at && (new Date(created_at)).toLocaleString()}
      </div>
      <div className="text-base whitespace-pre-line">{description}</div>
    </div>
  );
}
