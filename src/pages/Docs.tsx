
import { Link } from 'react-router-dom';

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold">📖 Allora OS Docs</h2>
        <p className="text-lg text-muted-foreground">Welcome to Allora. Here's how to get started:</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: '💡', title: 'Quick Install', desc: 'Install via Lovable or deploy via Supabase CLI' },
            { icon: '🔌', title: 'Enable Plugins', desc: 'Integrate with Stripe, Twilio, and more via /plugins' },
            { icon: '🎯', title: 'Create Strategy', desc: 'Launch your first strategy with /strategy-gen' },
            { icon: '📬', title: 'Setup Automation', desc: 'Configure exports and weekly reports' },
          ].map(item => (
            <div key={item.title} className="p-4 rounded-lg border bg-card">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="pt-8 text-sm text-muted-foreground border-t">
          Built by Natasha • 2025
        </div>
      </div>
    </div>
  );
}
