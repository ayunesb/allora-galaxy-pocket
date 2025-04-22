
import LegalLayout from "@/components/layouts/LegalLayout";

export default function DataProcessingAddendum() {
  return (
    <LegalLayout title="Data Processing Addendum">
      <p className="text-sm text-muted-foreground mb-4">
        Last Updated: March 11, 2025
      </p>
      
      <div className="space-y-4">
        <p>
          This DPA applies to Allora OS customers subject to GDPR, PIPEDA, or other data 
          protection laws. It outlines our role as a data processor, our responsibilities, 
          and your data rights.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Reach out to support@all-or-a.com to request a signed DPA or additional compliance documents.
        </p>
      </div>
    </LegalLayout>
  );
}
