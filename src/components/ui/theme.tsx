
"use client"

import { useTheme } from "@/components/ui/theme-provider"
import { ReactNode } from "react"

export interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useTheme()
  
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {children}
    </div>
  )
}
