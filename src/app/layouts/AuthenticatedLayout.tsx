
import RequireAuth from "@/guards/RequireAuth";
import Layout from "@/components/Layout";
import { Outlet } from "react-router-dom";

export default function AuthenticatedLayout() {
  return (
    <RequireAuth>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}
