
import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(prev => !prev);
  const closeSidebar = () => setIsOpen(false);
  const openSidebar = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, openSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Sidebar Components
export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  
  return (
    <aside className={`h-screen fixed left-0 top-0 z-20 flex flex-col border-r border-border bg-background transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="flex flex-1 flex-col h-full w-64 pt-16 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </aside>
  );
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col h-full">{children}</div>;
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-auto p-4 border-t">{children}</div>;
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="py-2">{children}</div>;
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-1 text-xs font-semibold uppercase text-muted-foreground">{children}</div>;
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-1">{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1 px-2">{children}</ul>;
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
  tooltip?: string;
}

export function SidebarMenuButton({ active, children, asChild, tooltip, ...props }: SidebarMenuButtonProps) {
  const Comp = asChild ? React.Fragment : 'button';
  const child = (
    <Comp {...(asChild ? {} : props)}>
      <div 
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          active 
            ? 'bg-primary-foreground text-primary' 
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title={tooltip}
        {...(asChild ? props : {})}
      >
        {children}
      </div>
    </Comp>
  );
  
  return asChild ? children : child;
}

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <button 
      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-background shadow-lg"
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}
