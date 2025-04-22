
import { Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Cookie className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Cookie Policy</h1>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">We use cookies to improve your experience, analyze traffic, and personalize strategy recommendations.</p>
        
        <p className="text-muted-foreground">Some cookies are essential for authentication, while others help us understand user behavior to improve onboarding and execution quality.</p>
        
        <p className="text-muted-foreground">By using this platform, you consent to the use of cookies. You can manage cookie preferences through your browser settings.</p>
      </div>
    </div>
  );
}
