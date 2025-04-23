
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TokenManager from "./TokenManager";

export default function AdminIntegrationsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Integrations</h1>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tokens">API Tokens</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="oauth">OAuth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle>Token Management</CardTitle>
            </CardHeader>
            <CardContent>
              <TokenManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-4 text-center text-muted-foreground">
                Webhook configuration coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="oauth">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-4 text-center text-muted-foreground">
                OAuth configuration coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
