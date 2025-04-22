
/**
 * @module sidebar
 * A comprehensive sidebar component with collapsible sections, 
 * mobile responsiveness, and keyboard shortcuts.
 */

export { useSidebar, SidebarProvider } from "./sidebar-context"
export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
  SidebarInput,
  SidebarInset,
  SidebarTrigger,
  SidebarRail
} from "./sidebar-components"
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "./sidebar-menu"
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent
} from "./sidebar-group"
