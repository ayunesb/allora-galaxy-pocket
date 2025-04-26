
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, PaintBucket, Bell, Key } from 'lucide-react';
import { ThemeCustomizer } from '@/components/settings/ThemeCustomizer';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { APIKeySettings } from '@/components/settings/ApiKeySettings';

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <ThemeCustomizer />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="api">
          <APIKeySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
