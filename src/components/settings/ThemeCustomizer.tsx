
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/components/ui/theme-provider';
import { useTenant } from '@/hooks/useTenant';

export const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { tenant, updateTenantProfile } = useTenant();
  
  const themeColor = tenant?.theme_color || 'indigo';

  const themeColors = [
    'indigo',
    'blue',
    'green',
    'red',
    'orange',
    'purple',
  ];
  
  const handleColorChange = async (color: string) => {
    try {
      if (updateTenantProfile && tenant?.id) {
        await updateTenantProfile({
          theme_color: color
        });
      }
    } catch (error) {
      console.error('Failed to update theme color:', error);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium">Theme Mode</h3>
          <p className="text-sm text-muted-foreground">
            Choose between light, dark, or system theme
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              size="sm"
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              size="sm"
            >
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              size="sm"
            >
              System
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">Theme Color</h3>
          <p className="text-sm text-muted-foreground">
            Select your primary brand color
          </p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {themeColors.map((color) => (
              <Button
                key={color}
                variant={color === themeColor ? 'default' : 'outline'}
                onClick={() => handleColorChange(color)}
                size="sm"
                className="capitalize"
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
