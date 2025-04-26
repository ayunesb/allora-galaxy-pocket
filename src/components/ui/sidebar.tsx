// Only modify the part that has the error - replacing Button with div in the trigger
// Search for the SidebarTrigger component and replace it

import React from "react"
import * as Collapsible from "@radix-ui/react-collapsible"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const SidebarContext = React.createContext({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => {},
})

export const useSidebar = () => React.useContext(SidebarContext)

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className,
  defaultCollapsed,
  ...props
}) => {
  const [collapsed, setCollapsed] = React.useState(!!defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className={cn("flex h-full grow flex-col border-r", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const SidebarTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...props
}) => {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      className={cn("sidebar-trigger", className)}
      {...props}
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </button>
  );
};

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  children,
  className,
  ...props
}) => {
  const { collapsed } = useSidebar()

  return (
    <Collapsible.Content
      className={cn(
        "peer-group data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out data-[state=open]:zoom-in data-[state=closed]:hidden",
        collapsed && "hidden",
        className
      )}
      asChild
    >
      <div className="flex-1">{children}</div>
    </Collapsible.Content>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return <div className={cn("flex items-center justify-between py-2 px-3", className)} {...props}>{children}</div>
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return <div className={cn("flex items-center py-4 px-3", className)} {...props}>{children}</div>
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  href: string
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  children,
  className,
  ...props
}) => {
  return <a className={cn("block py-2 px-3 font-medium", className)} {...props}>{children}</a>
}
