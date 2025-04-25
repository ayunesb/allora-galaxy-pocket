
import * as React from "react";
import { useContext, useState, createContext, useRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

// Context for Sidebar
type SidebarContextType = {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggleSidebar}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// Sidebar Components
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen } = useSidebar();
  
  return (
    <aside
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "fixed top-0 left-0 z-30 h-full w-[250px] border-r bg-background transition-transform duration-300 md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-[64px]",
        className
      )}
      {...props}
    />
  );
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex h-14 items-center border-b px-4", className)}
      {...props}
    />
  );
}

export interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto p-3", className)} {...props} />
  );
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn("mt-auto border-t p-4 px-3", className)}
      {...props}
    />
  );
}

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return <div className={cn("pb-4", className)} {...props} />;
}

export interface SidebarGroupLabelProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function SidebarGroupLabel({
  className,
  ...props
}: SidebarGroupLabelProps) {
  const { isOpen } = useSidebar();
  
  if (!isOpen) return null;
  
  return (
    <p
      className={cn(
        "mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export interface SidebarGroupContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupContent({
  className,
  ...props
}: SidebarGroupContentProps) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export interface SidebarMenuProps
  extends React.HTMLAttributes<HTMLUListElement> {}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return (
    <ul role="menu" className={cn("min-w-full", className)} {...props} />
  );
}

export interface SidebarMenuItemProps
  extends React.HTMLAttributes<HTMLLIElement> {}

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return (
    <li
      role="menuitem"
      className={cn("min-w-full", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "group relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&[data-active]]:bg-accent/50",
  {
    variants: {
      variant: {
        default: "",
        active: "bg-accent/50 text-accent-foreground font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    React.RefAttributes<HTMLButtonElement> {
  variant?: "default" | "active";
  tooltip?: string;
  asChild?: boolean;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, variant, tooltip, asChild = false, ...props }, ref) => {
  const Component = asChild ? React.Slot : "button";
  const { isOpen } = useSidebar();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = !isOpen && tooltip;

  return (
    <div className="relative group">
      <Component
        ref={ref}
        className={cn(
          sidebarMenuButtonVariants({ variant }),
          isOpen 
            ? "justify-start gap-2" 
            : "flex-col justify-center items-center gap-1 py-3",
          className
        )}
        {...props}
      />
      
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute left-full ml-2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md hidden group-hover:block z-50 whitespace-nowrap"
        >
          {tooltip}
        </div>
      )}
    </div>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

// Utils functions
export function SidebarLogoWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  
  return (
    <div className={cn(
      "flex items-center",
      isOpen ? "justify-start" : "justify-center"
    )}>
      {children}
    </div>
  );
}

// Button to toggle sidebar
export interface SidebarToggleProps extends ButtonProps {}

export function SidebarToggle({ className, ...props }: SidebarToggleProps) {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={cn("", className)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
        <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
        <path d="M4 12H2" />
        <path d="M10 12H8" />
        <path d="M16 12h-2" />
        <path d="M22 12h-2" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
