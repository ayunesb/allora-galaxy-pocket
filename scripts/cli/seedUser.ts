
import { createClient } from "@supabase/supabase-js";

export async function seedUser(options?: { 
  tenantId?: string, 
  email?: string, 
  name?: string 
}) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
  );

  const id = "user-" + Math.random().toString(36).slice(2, 8);
  const defaultTenantId = "tenant-001";

  const { data, error } = await supabase.auth.signUp({
    email: options?.email || `${id}@demo.com`,
    password: "password123", // You might want to generate a more secure password
    options: {
      data: {
        name: options?.name || "Test User",
        tenant_id: options?.tenantId || defaultTenantId
      }
    }
  });

  if (error) {
    console.error("❌ Failed to create user:", error);
    throw error;
  }

  console.log("✅ Created user:", data.user?.id);
  return data.user?.id;
}

// Allow direct execution if run as a script
if (import.meta.main) {
  seedUser();
}
