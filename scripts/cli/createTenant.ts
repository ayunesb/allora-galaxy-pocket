
import { createClient } from "@supabase/supabase-js";

export async function createTenant(options?: { 
  name?: string, 
  usageCredits?: number 
}) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
  );

  const id = "tenant-" + Math.random().toString(36).slice(2, 8);

  const { data, error } = await supabase.from("tenant_profiles").insert({
    id,
    name: options?.name || "CLI Demo Tenant",
    usage_credits: options?.usageCredits || 100,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error("❌ Failed to create tenant:", error);
    throw error;
  }

  console.log("✅ Created tenant:", id);
  return id;
}

// Allow direct execution if run as a script
if (import.meta.main) {
  createTenant();
}
