
import LegalLayout from "@/components/layouts/LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy">
      <p className="text-sm text-muted-foreground mb-4">
        Last Updated: March 10, 2025
      </p>
      
      <div className="space-y-4">
        <p>
          This Cookie Policy explains how Allora OS uses cookies and similar technologies 
          to enhance your experience on our platform. Some cookies are strictly necessary, 
          others help us improve performance and personalize your experience.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          You can manage your preferences at any time using the cookie settings panel or browser controls.
        </p>
      </div>
    </LegalLayout>
  );
}
