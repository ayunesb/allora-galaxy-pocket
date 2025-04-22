
import { FileText } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Terms of Use</h1>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">Welcome to ALLORA APP. By accessing or using our services, you agree to the following Terms of Use. These terms are governed by the laws of Mexico.</p>
        
        <p className="text-muted-foreground">You agree not to misuse, reverse engineer, copy, resell, or replicate the platform. The AI-generated content is provided for informational purposes and should be reviewed before execution.</p>
        
        <p className="text-muted-foreground">All strategies executed are based on user approvals. Users are responsible for complying with local laws when deploying campaigns (including WhatsApp, email, and ad platforms).</p>
        
        <p className="text-muted-foreground">ALLORA APP is not responsible for outcomes resulting from user-deployed strategies, integrations, or third-party platform limitations.</p>
      </div>
    </div>
  );
}
