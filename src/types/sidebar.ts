
import { ReactNode } from 'react';

export interface SidebarNavItem {
  title: string;
  items: {
    title: string;
    href: string;
    icon: ReactNode;
    badge?: string;
  }[];
}
