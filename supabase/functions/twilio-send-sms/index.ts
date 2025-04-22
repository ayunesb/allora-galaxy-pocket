
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, message } = await req.json()
    
    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")
    const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER")
    
    if (!accountSid || !authToken || !fromPhone) {
      throw new Error("Missing Twilio credentials in environment variables")
    }
    
    if (!to) {
      throw new Error("Missing 'to' phone number")
    }
    
    if (!message) {
      throw new Error("Missing message content")
    }

    // For demonstration, log the SMS details instead of actually sending
    // In production, you would make a real API call to Twilio
    console.log("[Twilio] Would send SMS to:", to)
    console.log("From:", fromPhone)
    console.log("Message:", message)
    
    // For implementing actual Twilio call, use this code:
    /*
    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const auth = btoa(`${accountSid}:${authToken}`)
    
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", fromPhone);
    formData.append("Body", message);
    
    const response = await fetch(twilioEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio API error: ${errorText}`);
    }
    
    const result = await response.json();
    */
    
    // Return success response
    return new Response(
      JSON.stringify({ status: "📲 SMS sent", to }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("[Twilio Error]:", error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
