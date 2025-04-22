
import LegalLayout from "@/components/layouts/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <div className="space-y-6">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Effective Date: April 21, 2025</p>
          <p className="text-sm text-muted-foreground">Entity: ALLORA APP</p>
          <p className="text-sm text-muted-foreground">Jurisdiction: Mexico | GDPR | PIPEDA | CCPA Compliant</p>
        </div>

        <p className="leading-7">
          We collect and process limited personal and business information to operate Allora OS. 
          Your privacy is a priority.
        </p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">What We Collect</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Contact info: name, email, company</li>
            <li>Usage data: clicks, campaigns, preferences</li>
            <li>Device info: IP address, browser</li>
            <li>AI input/output history (for functionality only)</li>
            <li>Analytics and tracking via GA4, Meta, LinkedIn</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">How We Use It</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Strategy generation and campaign execution</li>
            <li>Support, onboarding, and coaching feedback</li>
            <li>Analytics and performance improvements</li>
            <li>Compliance and legal obligations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Sharing</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Never sold</li>
            <li>Shared only with trusted processors: Supabase, Stripe, OpenAI, etc.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">International Transfers</h2>
          <p>Your data may be stored in Mexico or the U.S. We use legal transfer mechanisms 
          (SCCs, contracts) when required.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Your Rights (GDPR/CCPA)</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Access, rectify, or delete your data</li>
            <li>Withdraw consent</li>
            <li>Object to marketing</li>
            <li>Opt-out of data sharing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Data Retention</h2>
          <p>We retain data as long as needed for services, legal compliance, or audits. 
          You may request deletion at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <p>support@all-or-a.com</p>
        </section>
      </div>
    </LegalLayout>
  );
}
