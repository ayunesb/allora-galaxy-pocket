
import React from 'react';
import { RoleChangeRequestForm } from './components/RoleChangeRequestForm';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import ThemeCustomizer from "@/components/settings/ThemeCustomizer";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="account" className="max-w-4xl">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="role-request">Role Request</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="text-sm text-muted-foreground">
            Account management options coming soon.
          </div>
        </TabsContent>
        
        <TabsContent value="appearance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemeCustomizer />
          </div>
        </TabsContent>
        
        <TabsContent value="role-request">
          <RoleChangeRequestForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
