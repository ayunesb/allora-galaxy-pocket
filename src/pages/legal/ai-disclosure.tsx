
import { Info } from "lucide-react";

export default function AIDisclosure() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 text-sm">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-6 w-6" />
        <h1 className="text-2xl font-bold">🤖 AI Disclosure</h1>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p>ALLORA APP uses AI-generated content to suggest strategies, campaigns, and coaching feedback.</p>
        <p>All AI decisions are based on inputs provided by users and system analysis. These are suggestions only and should be reviewed before execution.</p>
        <p>All executions are subject to user approval. The AI does not replace legal, financial, or medical advisors.</p>
      </div>
    </div>
  );
}
