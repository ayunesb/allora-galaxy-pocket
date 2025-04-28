
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const APP_URL = "https://yourapp.com"; // Update to your deployed app domain!

export default function BulkInviteCreator() {
  const [role, setRole] = useState("client");
  const [emails, setEmails] = useState("");
  const [redirectTo, setRedirectTo] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    const emailList = emails.split('\n').map(e => e.trim()).filter(Boolean);
    if (emailList.length === 0) {
      toast.error("No emails provided");
      return;
    }

    setIsLoading(true);
    setLinks([]);
    const newLinks: string[] = [];
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    for (const email of emailList) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      try {
        // Use a custom endpoint or stored procedure instead of direct table access
        const { error } = await supabase.functions.invoke('create-invite-code', {
          body: {
            code,
            email,
            role,
            redirectTo: redirectTo || null,
            expiresAt: expiry
          }
        });
        
        if (error) {
          toast.error(`Failed for ${email}: ${error.message}`);
          continue;
        }
        
        const url = `${APP_URL}/auth/signup?code=${code}&role=${role}&email=${encodeURIComponent(email)}`;
        newLinks.push(url);
      } catch (error: any) {
        toast.error(`Error processing ${email}: ${error.message}`);
      }
    }

    setLinks(newLinks);
    setIsLoading(false);
    toast.success("Invite links generated!");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Bulk Invite Generator</h1>
      <label className="block text-sm mb-1 font-medium">Invitee Emails</label>
      <Textarea
        placeholder="Paste emails, one per line"
        rows={5}
        className="mb-3"
        value={emails}
        onChange={e => setEmails(e.target.value)}
        disabled={isLoading}
      />

      <label className="block text-sm mb-1 font-medium">Role</label>
      <select
        className="mb-3 p-2 border rounded w-full"
        value={role}
        onChange={e => setRole(e.target.value)}
        disabled={isLoading}
      >
        <option value="client">🧑‍💼 Client</option>
        <option value="developer">👨‍💻 Developer</option>
        <option value="admin">👨‍✈️ Admin (use with caution)</option>
      </select>

      <label className="block text-sm mb-1 font-medium">Custom Redirect After Signup (optional)</label>
      <Input
        placeholder="/dashboard or full URL"
        className="mb-4"
        value={redirectTo}
        onChange={e => setRedirectTo(e.target.value)}
        disabled={isLoading}
      />

      <Button
        onClick={generate}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Generating..." : "🚀 Generate Links"}
      </Button>

      {links.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2 text-sm">Generated Invite Links</h2>
          <ul className="space-y-2">
            {links.map((l, i) => (
              <li key={i}><code className="break-all">{l}</code></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
