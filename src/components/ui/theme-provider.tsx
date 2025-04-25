
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

type Theme = "dark" | "light";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  themeColor: string;
  setTheme: (theme: Theme) => void;
  updateThemeColor: (color: string) => Promise<void>;
}

const initialState: ThemeProviderState = {
  theme: "light",
  themeColor: "indigo",
  setTheme: () => null,
  updateThemeColor: async () => {}
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [themeColor, setThemeColor] = useState("indigo");
  const [mounted, setMounted] = useState(false);
  
  // Get tenant context data
  const tenantContext = useTenant();
  const tenant = tenantContext?.tenant;

  // Update theme when tenant changes
  useEffect(() => {
    if (!tenant) return;

    if (tenant?.theme_mode) {
      setTheme(tenant.theme_mode as Theme);
    }
    
    if (tenant?.theme_color) {
      setThemeColor(tenant.theme_color);
    }
  }, [tenant]);

  // On mount, load theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey);
    
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    
    setMounted(true);
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    const body = document.body;

    // Remove previous theme classes
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");
    
    // Add current theme class
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Store theme in localStorage
    localStorage.setItem(storageKey, theme);
    
    // Set explicit background color to match theme
    document.body.style.backgroundColor = theme === 'dark' 
      ? 'hsl(222.2, 84%, 4.9%)' // Dark background
      : 'hsl(0, 0%, 100%)';     // Light background
  }, [theme, storageKey, mounted]);

  const updateThemeColor = async (color: string) => {
    if (!tenant?.id) return;

    try {
      setThemeColor(color);
      const { error } = await supabase
        .from('tenant_profiles')
        .update({ theme_color: color })
        .eq('id', tenant.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating theme color:", error);
      throw error;
    }
  };

  // Use this value to prevent hydration mismatch
  const value = {
    theme,
    themeColor,
    setTheme: (theme: Theme) => {
      setTheme(theme);
      if (tenant?.id) {
        supabase
          .from('tenant_profiles')
          .update({ theme_mode: theme })
          .eq('id', tenant.id)
          .then(({ error }) => {
            if (error) console.error("Error updating theme mode:", error);
          });
      }
    },
    updateThemeColor
  };

  // Return a static theme provider during SSR
  if (!mounted) {
    return <div className="bg-background text-foreground">{children}</div>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
