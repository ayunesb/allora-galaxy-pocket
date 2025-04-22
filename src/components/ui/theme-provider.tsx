
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
  const { tenant } = useTenant();
  const [theme, setTheme] = useState<Theme>(
    () => {
      if (tenant?.theme_mode) {
        return tenant.theme_mode as Theme;
      }
      
      const storedTheme = localStorage.getItem(storageKey);
      return (storedTheme as Theme) || defaultTheme;
    }
  );
  const [themeColor, setThemeColor] = useState(tenant?.theme_color || "indigo");

  useEffect(() => {
    if (tenant?.theme_mode) {
      setTheme(tenant.theme_mode as Theme);
    }
    
    if (tenant?.theme_color) {
      setThemeColor(tenant.theme_color);
    }
  }, [tenant]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

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
