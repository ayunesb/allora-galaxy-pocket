
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminOnly from "@/guards/AdminOnly";

export default function AdminDashboardPage() {
  return (
    <AdminOnly>
      <AdminDashboard />
    </AdminOnly>
  );
}
