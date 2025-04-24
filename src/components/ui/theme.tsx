
"use client"

import { useTheme } from "@/components/ui/theme-provider"
import { ReactNode, useEffect } from "react"

export interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useTheme()
  
  // Apply theme to document body as well as the wrapper div
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme === 'dark' ? 'dark' : 'light');
    
    // Set background color on the body element directly to ensure no white background
    document.body.style.backgroundColor = theme === 'dark' ? 'var(--background)' : 'var(--background)';
  }, [theme]);
  
  return (
    <div className={`min-h-screen bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      {children}
    </div>
  )
}
