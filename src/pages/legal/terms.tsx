
import LegalLayout from "@/components/layouts/LegalLayout";

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service">
      <div className="space-y-6">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Effective Date: April 21, 2025</p>
          <p className="text-sm text-muted-foreground">Entity: ALLORA APP</p>
          <p className="text-sm text-muted-foreground">Jurisdiction: Mexico</p>
        </div>

        <p className="leading-7">
          Welcome to Allora OS, the AI-powered business operating system. These Terms of Service ("Terms") 
          govern your use of our web and mobile platform ("Services"). By using Allora OS, you agree to 
          be bound by these Terms.
        </p>

        <div className="space-y-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. License & Scope</h2>
            <p>You are granted a non-exclusive, revocable license to access Allora for your personal or 
            business use. You may not sublicense, resell, reverse engineer, or create derivative works 
            without explicit consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Account Registration</h2>
            <p>You must provide accurate information and keep your account secure. You're responsible for 
            all activity under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Subscription & Payment</h2>
            <p>Subscriptions auto-renew unless canceled. Fees are processed via Stripe and subject to our 
            Refund Policy. Failure to pay may result in suspension.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Content and Ownership</h2>
            <p>Allora does not claim ownership of your content. However, you grant us a limited license 
            to process, display, and store content as required to deliver the Service. AI-generated content 
            is considered part of "Your Content."</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. AI Disclaimers</h2>
            <p>AI-generated outputs are suggestions and may contain errors. You are responsible for final 
            review and compliance. Outputs may not be unique.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Acceptable Use</h2>
            <p>You agree not to use Allora for illegal, fraudulent, or harassing purposes. We reserve 
            the right to terminate accounts in violation.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. App Store Terms</h2>
            <p>When using Allora on iOS or Android, you agree to the Apple or Google Play Store terms 
            as applicable.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Arbitration & Dispute Resolution</h2>
            <p>By using Allora, you agree to binding arbitration. You waive the right to participate in 
            class actions. Jurisdiction is Mexico unless otherwise required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Termination</h2>
            <p>We reserve the right to terminate your access for any violation. You may cancel at any 
            time via your account or by emailing support@all-or-a.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Contact</h2>
            <p>For questions: support@all-or-a.com</p>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
