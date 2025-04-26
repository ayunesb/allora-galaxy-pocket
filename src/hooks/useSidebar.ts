
import React, { useState, createContext, useContext } from 'react';
import { Home, Settings, Rocket, Users } from "lucide-react";

// Define the structure of a Sidebar Item
interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

// Define the Sidebar Context Type
interface SidebarContextType {
  sidebarItems: SidebarItem[];
  collapsed: boolean;
  toggleSidebar: () => void;
}

// Create a context with a default empty state
const SidebarContext = createContext<SidebarContextType>({
  sidebarItems: [],
  collapsed: false,
  toggleSidebar: () => {}
});

// Sidebar Provider Component
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: <Home />,
      path: "/dashboard",
    },
    {
      title: "Campaigns",
      icon: <Rocket />,
      path: "/campaigns",
    },
    {
      title: "Agents",
      icon: <Users />,
      path: "/agents",
    },
    {
      title: "Settings",
      icon: <Settings />,
      path: "/settings",
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ sidebarItems, collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use Sidebar Context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
};
