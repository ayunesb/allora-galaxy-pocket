
import LegalLayout from "@/components/layouts/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-sm text-muted-foreground mb-4">
        Effective Date: March 11, 2025
      </p>
      
      <div className="space-y-4">
        <p>
          This Privacy Policy describes how Allora OS collects, uses, and shares your 
          personal information when you use our platform.
        </p>

        <p>
          We comply with GDPR, CCPA, and PIPEDA. We never sell your data. Your personal 
          and business data is encrypted and used only to improve your strategy.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Contact our Data Protection Officer at support@all-or-a.com for data rights inquiries.
        </p>
      </div>
    </LegalLayout>
  );
}
