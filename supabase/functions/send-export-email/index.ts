
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, attachmentUrl, attachmentName }: EmailRequest = await req.json();

    // Build email options
    const emailOptions: any = {
      from: "Allora OS <onboarding@resend.dev>",
      to,
      subject,
      html,
    };

    // If attachment URL is provided, fetch it and attach it
    if (attachmentUrl) {
      try {
        const response = await fetch(attachmentUrl);
        if (!response.ok) {
          throw new Error(`Error fetching attachment: ${response.statusText}`);
        }
        
        const attachmentBuffer = await response.arrayBuffer();
        
        emailOptions.attachments = [
          {
            content: attachmentBuffer,
            filename: attachmentName || 'report.pdf',
            type: 'application/pdf',
          },
        ];
      } catch (attachError) {
        console.error("Error attaching file:", attachError);
        // Continue without attachment, but add error message to email
        emailOptions.html = `
          ${html}
          <p style="color: red;">Note: The attachment could not be included due to an error.</p>
          <p>You can download the report directly using the link above.</p>
        `;
      }
    }

    // Send the email
    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Email sending failed:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ status: "success", data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error in send-export-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
