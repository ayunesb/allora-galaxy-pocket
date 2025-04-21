
import { createClient } from "@supabase/supabase-js";

export async function setupPlugins(tenantId?: string, plugins?: string[]) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
  );

  const targetTenantId = tenantId || process.argv[2] || "tenant-001";
  const targetPlugins = plugins || ["stripe", "hubspot", "twilio"];

  const pluginUpserts = targetPlugins.map(p => ({
    tenant_id: targetTenantId,
    plugin_key: p,
    enabled: true
  }));

  const { data, error } = await supabase.from("tenant_plugins").upsert(pluginUpserts);

  if (error) {
    console.error("❌ Failed to enable plugins:", error);
    throw error;
  }

  console.log(`✅ Plugins enabled for: ${targetTenantId}`);
  return targetPlugins;
}

// Allow direct execution if run as a script
if (import.meta.main) {
  setupPlugins();
}
