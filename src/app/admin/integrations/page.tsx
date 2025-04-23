
import TokenManager from "./TokenManager";
import AdminOnly from "@/guards/AdminOnly";

export default function IntegrationsPage() {
  return (
    <AdminOnly>
      <TokenManager />
    </AdminOnly>
  );
}
