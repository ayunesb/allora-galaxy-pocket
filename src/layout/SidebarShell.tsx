import { ReactNode } from "react";
import SidebarNav from "../components/SidebarNav";

export default function SidebarShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <SidebarNav />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  );
}
