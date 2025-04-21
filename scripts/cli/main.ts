
import { createTenant } from "./createTenant";
import { setupPlugins } from "./setupPlugins";
import { seedUser } from "./seedUser";

async function main() {
  try {
    const tenantId = await createTenant();
    await setupPlugins(tenantId);
    await seedUser({ tenantId });
    console.log("🚀 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

main();
