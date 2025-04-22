
import LegalLayout from "@/components/layouts/LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy">
      <div className="space-y-6">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Effective Date: April 21, 2025</p>
          <p className="text-sm text-muted-foreground">Entity: ALLORA APP</p>
          <p className="text-sm text-muted-foreground">Cookie Banner Required in EU</p>
        </div>

        <p className="leading-7">
          We use cookies to improve your Allora experience. These include:
        </p>

        <div className="space-y-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Strictly Necessary</h2>
            <p>Enable logins, security, and navigation</p>
            <p className="text-sm text-muted-foreground">E.g., Supabase session, login authentication</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Performance</h2>
            <p>Track usage and errors (via GA4, Hotjar, FullStory)</p>
            <p className="text-sm text-muted-foreground">E.g., page views, clicks</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Functional</h2>
            <p>Save preferences, personalize content</p>
            <p className="text-sm text-muted-foreground">E.g., theme selector, dashboard state</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Advertising</h2>
            <p>Enable retargeting across social and ad platforms</p>
            <p className="text-sm text-muted-foreground">E.g., Meta Pixel, LinkedIn Insight Tag</p>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Your Options:</h2>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Set preferences on cookie banner</li>
              <li>Use browser settings to block or delete</li>
              <li>View tracking partner opt-outs at <a href="https://optout.aboutads.info/" 
                className="text-primary hover:underline">https://optout.aboutads.info/</a></li>
            </ul>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
