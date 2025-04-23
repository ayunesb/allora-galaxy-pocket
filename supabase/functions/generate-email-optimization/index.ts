
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!
    });
    
    const { emailSubject, emailBody } = await req.json();
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an email marketing expert who specializes in high-performing copy."
        },
        { 
          role: "user", 
          content: `Here's an email that needs optimization:
          
          Subject: ${emailSubject}
          
          Body:
          ${emailBody}
          
          Make it tighter, clearer, and higher performing by:
          1. Improving the subject line for higher open rates
          2. Streamlining the body text
          3. Clarifying the value proposition
          4. Strengthening the call-to-action
          
          Provide reasoning for your changes.`
        }
      ],
      temperature: 0.7,
    });

    const content = result.choices[0].message.content;
    
    // Extract improved subject line
    const subjectMatch = content.match(/Subject[^:]*:(.*?)(?=\n\n|\nBody)/is);
    const subject = subjectMatch ? subjectMatch[1].trim() : emailSubject;
    
    // Extract reasoning if available
    const reasoningMatch = content.match(/reasoning[^:]*:(.*?)(?=$)/is);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : "Optimized for better engagement and click-through rate";
    
    // Extract improved body or use the whole response if parsing fails
    const bodyMatch = content.match(/Body[^:]*:(.*?)(?=\n\nReasoning|\n\nWhy|$)/is);
    const improvedBody = bodyMatch ? bodyMatch[1].trim() : content;

    return new Response(
      JSON.stringify({
        subject: subject,
        improvedBody: improvedBody,
        reasoning: reasoning
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-email-optimization function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
