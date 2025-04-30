
import { ReactNode } from "react";
import SidebarNav from "../components/SidebarNav";
import Topbar from "../components/Topbar";

export default function SidebarShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
