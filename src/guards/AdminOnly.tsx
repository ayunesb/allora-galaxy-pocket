
import { ReactNode } from "react";
import RoleGuard from "./RoleGuard";

export default function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      {children}
    </RoleGuard>
  );
}
