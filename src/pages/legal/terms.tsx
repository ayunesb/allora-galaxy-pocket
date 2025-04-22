
import LegalLayout from "@/components/layouts/LegalLayout";

export default function TermsOfUse() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="text-sm text-muted-foreground mb-4">
        Last Updated: March 11, 2025
      </p>
      
      <div className="space-y-4">
        <p>
          Welcome to Allora OS. These Terms of Service ("Terms") govern your use of the Allora app and services. 
          By accessing or using the service, you agree to be bound by these Terms.
        </p>

        <p>
          These Terms are legally binding. By using Allora OS, you agree to our arbitration clause, 
          data usage practices, and your responsibilities as a user.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          For full terms, contact us at support@all-or-a.com or view our Data Processing Addendum for regulatory compliance.
        </p>
      </div>
    </LegalLayout>
  );
}
