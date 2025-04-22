
import { createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

interface ThemeContextType {
  themeColor: string;
  themeMode: string;
  updateTheme: (color: string, mode: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();

  useEffect(() => {
    if (tenant?.theme_mode) {
      document.documentElement.classList.toggle('dark', tenant.theme_mode === 'dark');
    }
  }, [tenant?.theme_mode]);

  const updateTheme = async (color: string, mode: string) => {
    if (!tenant?.id) return;

    const { error } = await supabase
      .from('tenant_profiles')
      .update({ theme_color: color, theme_mode: mode })
      .eq('id', tenant.id);

    if (error) throw error;
  };

  return (
    <ThemeContext.Provider value={{
      themeColor: tenant?.theme_color || 'indigo',
      themeMode: tenant?.theme_mode || 'light',
      updateTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
