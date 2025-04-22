
import { AiDisclosure } from "lucide-react";

export default function AIDisclosure() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <AiDisclosure className="h-6 w-6" />
        <h1 className="text-2xl font-bold">AI Disclosure</h1>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">ALLORA APP uses AI-generated content to suggest strategies, campaigns, and coaching feedback.</p>
        
        <p className="text-muted-foreground">All AI decisions are based on inputs provided by users and system analysis. These are suggestions only and should be reviewed before execution.</p>
        
        <p className="text-muted-foreground">All executions are subject to user approval. The AI does not replace legal, financial, or medical advisors.</p>
      </div>
    </div>
  );
}
