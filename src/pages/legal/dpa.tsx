
import { Dpa } from "lucide-react";

export default function DataProcessingAddendum() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Dpa className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Data Processing Addendum (DPA)</h1>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">This DPA applies when ALLORA APP processes Personal Data on behalf of a customer as part of delivering its services.</p>
        
        <p className="text-muted-foreground">The data controller remains the user or entity creating the account. ALLORA APP is the processor acting on your instructions, including for campaign personalization, CRM syncing, and analytics.</p>
        
        <p className="text-muted-foreground">ALLORA APP ensures access control, encryption, backups, and audit logging. For questions about compliance, please contact <a className="text-primary hover:underline" href="mailto:support@all-or-a.com">support@all-or-a.com</a>.</p>
      </div>
    </div>
  );
}
