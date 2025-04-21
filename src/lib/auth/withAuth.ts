
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export async function withAuth(req: Request, handler: Function) {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Attach user to request context
  return await handler({ req, user });
}
