
import { Privacy } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Privacy className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">ALLORA APP is committed to protecting your privacy in compliance with GDPR (EU), PIPEDA (Canada), and applicable data protection laws in Mexico.</p>
        
        <p className="text-muted-foreground">We collect data for onboarding, strategy generation, and campaign execution. We do not sell your data. Your data is encrypted and stored securely via Supabase.</p>
        
        <p className="text-muted-foreground">Users may request data export or deletion at any time by emailing <a className="text-primary hover:underline" href="mailto:support@all-or-a.com">support@all-or-a.com</a>.</p>
        
        <p className="text-muted-foreground">For data processing and AI personalization, we store inputs in our `ai_memory` system which you can request to reset or delete.</p>
      </div>
    </div>
  );
}
