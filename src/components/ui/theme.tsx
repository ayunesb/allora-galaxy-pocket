
"use client"

import { useTheme } from "@/components/ui/theme-provider"
import { ReactNode, useEffect } from "react"

export interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useTheme();
  
  // Apply theme to document body as well as the wrapper div
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme === 'dark' ? 'dark' : 'light');
    
    // Set background color on the body element directly
    document.body.style.backgroundColor = theme === 'dark' 
      ? 'hsl(222.2, 84%, 4.9%)' // Dark background
      : 'hsl(0, 0%, 100%)';     // Light background
  }, [theme]);
  
  return (
    <div className={theme || "light"}>
      <div className="bg-background text-foreground min-h-screen">
        {children}
      </div>
    </div>
  );
}
