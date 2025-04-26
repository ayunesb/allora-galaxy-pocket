
import React, { ReactNode, forwardRef } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

// Base sidebar container
export const Sidebar = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { collapsed } = useSidebar();
  
  return (
    <div
      className={cn(
        "flex flex-col h-screen transition-all duration-300 bg-background border-r",
        collapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Sidebar header component
export const SidebarHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center h-16 px-4 border-b shrink-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Sidebar content (scrollable area)
export const SidebarContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto py-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Sidebar footer
export const SidebarFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center h-16 px-4 border-t shrink-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Sidebar item component
interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

export const SidebarItem = forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ className, isActive, icon, label, children, ...props }, ref) => {
    const { collapsed } = useSidebar();
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center px-3 py-2 rounded-md mb-1 cursor-pointer transition-colors",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-muted text-foreground/70 hover:text-foreground",
          className
        )}
        {...props}
      >
        {icon && <div className="mr-3 text-lg">{icon}</div>}
        {!collapsed && label && <div>{label}</div>}
        {!collapsed && children && <div>{children}</div>}
      </div>
    );
  }
);
SidebarItem.displayName = "SidebarItem";

// Link wrapper for sidebar item
interface SidebarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
}

export const SidebarLink = forwardRef<HTMLAnchorElement, SidebarLinkProps>(
  ({ className, isActive, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "block w-full no-underline",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
);
SidebarLink.displayName = "SidebarLink";

// Sidebar section divider
export const SidebarSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) => (
  <hr
    className={cn(
      "my-2 border-t",
      className
    )}
    {...props}
  />
);

// Sidebar section
export const SidebarSection = ({
  title,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { title?: string }) => {
  const { collapsed } = useSidebar();
  
  return (
    <div
      className={cn(
        "py-2 px-3",
        className
      )}
      {...props}
    >
      {title && !collapsed && (
        <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
};

// For compatibility with existing code - these can be adjusted to map to the components above
export const SidebarGroup = SidebarSection;
export const SidebarGroupLabel = ({ children }: { children: ReactNode }) => {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return (
    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
      {children}
    </h4>
  );
};
export const SidebarGroupContent = ({ children }: { children: ReactNode }) => <div>{children}</div>;
export const SidebarMenu = ({ children }: { children: ReactNode }) => <div className="space-y-1">{children}</div>;
export const SidebarMenuItem = ({ children }: { children: ReactNode }) => <div>{children}</div>;
export const SidebarMenuButton = ({ children, asChild, ...props }: { children: ReactNode; asChild?: boolean; tooltip?: string }) => (
  <div className="px-1">
    {children}
  </div>
);
export const SidebarRail = Sidebar;
export const SidebarTrigger = () => null;

export default ({ children }: { children: ReactNode }) => <>{children}</>;
