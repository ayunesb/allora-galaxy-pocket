
import * as React from "react"
import { cn } from "@/lib/utils"
import { SidebarBaseProps } from "./sidebar-types"

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarBaseProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
)
SidebarHeader.displayName = "SidebarHeader"
