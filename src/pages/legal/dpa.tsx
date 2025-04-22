
import LegalLayout from "@/components/layouts/LegalLayout";

export default function DPA() {
  return (
    <LegalLayout title="Data Processing Addendum">
      <div className="space-y-6">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Effective Date: April 21, 2025</p>
          <p className="text-sm text-muted-foreground">Entity: ALLORA APP</p>
          <p className="text-sm text-muted-foreground">Jurisdiction: Mexico | GDPR-Compliant</p>
        </div>

        <p className="leading-7">
          This DPA applies when you use Allora OS and are subject to GDPR, LGPD, or PIPEDA.
        </p>

        <section>
          <h2 className="text-lg font-semibold mb-2">Roles</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>You = Controller</li>
            <li>Allora = Processor</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Subprocessors:</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Supabase (DB, Auth)</li>
            <li>OpenAI / Anthropic (LLMs)</li>
            <li>Vercel (Hosting)</li>
            <li>Stripe (Billing)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Obligations</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Secure storage (encryption at rest + in transit)</li>
            <li>Audit support (upon request)</li>
            <li>72h breach notifications</li>
            <li>Anonymization when possible</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">International Transfers</h2>
          <p>Allora ensures lawful cross-border data transfer using SCCs and DPA-backed contracts.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <p>support@all-or-a.com</p>
          <p>DPA requests: legal@all-or-a.com</p>
        </section>
      </div>
    </LegalLayout>
  );
}
