
import * as React from "react"

/**
 * Props shared by all sidebar components
 */
export interface SidebarBaseProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
  children?: React.ReactNode
}

/**
 * Props for components that can be rendered as different elements
 */
export interface AsChildProps {
  /** Whether to render as a different element via Radix Slot */
  asChild?: boolean
}

/**
 * Props for menu items that can display tooltips
 */
export interface TooltipProps {
  /** Content or props for the tooltip */
  tooltip?: string | React.ComponentProps<typeof import("@/components/ui/tooltip").TooltipContent>
}

/**
 * Props specific to the main Sidebar component
 */
export interface SidebarProps extends SidebarBaseProps {
  /** Which side to render the sidebar on */
  side?: "left" | "right"
  /** Visual variant of the sidebar */
  variant?: "sidebar" | "floating" | "inset"
  /** How the sidebar collapses */
  collapsible?: "offcanvas" | "icon" | "none"
}
