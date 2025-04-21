
import { supabase } from "@/integrations/supabase/client";

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, html }
  });

  if (error) {
    console.error("[Email] Error:", error);
    throw error;
  }

  console.log("[Email] Sent successfully:", data);
  return data;
}
