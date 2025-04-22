
"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { ReactNode } from "react"

export interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { themeMode } = useTheme()
  
  return (
    <div className={themeMode === 'dark' ? 'dark' : ''}>
      {children}
    </div>
  )
}
