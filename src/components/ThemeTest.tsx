
import React from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function ThemeTest() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Theme Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded bg-card text-card-foreground border">
          Current theme: <strong>{theme}</strong>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
          >
            <Sun className="mr-2 h-4 w-4" /> Light
          </Button>
          
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            <Moon className="mr-2 h-4 w-4" /> Dark
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
