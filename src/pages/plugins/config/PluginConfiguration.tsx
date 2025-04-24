
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Trash, AlertCircle } from "lucide-react";
import { usePlugins } from "@/hooks/usePlugins";
import { usePluginManager } from "@/hooks/usePluginManager";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PluginConfiguration() {
  const { pluginKey } = useParams<{ pluginKey: string }>();
  const navigate = useNavigate();
  const { activePlugins } = usePlugins();
  const { getPluginConfig, updatePluginConfig, uninstallPlugin, isConfiguring } = usePluginManager();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("settings");
  
  useEffect(() => {
    const loadPluginConfig = async () => {
      if (!pluginKey) return;
      
      setIsLoading(true);
      try {
        const pluginConfig = await getPluginConfig(pluginKey as any);
        setConfig(pluginConfig);
      } catch (error) {
        console.error("Error loading plugin config:", error);
        toast.error("Failed to load plugin configuration");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPluginConfig();
  }, [pluginKey]);
  
  if (!pluginKey) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Invalid plugin key. Please go back to the plugins page and select a valid plugin.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          onClick={() => navigate("/plugins")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plugins
        </Button>
      </div>
    );
  }
  
  const isActive = activePlugins.includes(pluginKey as any);
  
  const handleUpdateConfig = async () => {
    const success = await updatePluginConfig(pluginKey as any, config);
    if (success) {
      toast.success("Plugin configuration updated successfully");
    }
  };
  
  const handleUninstall = async () => {
    const success = await uninstallPlugin(pluginKey as any);
    if (success) {
      navigate("/plugins");
    }
  };
  
  const handleInputChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const renderConfigFields = () => {
    if (!config || Object.keys(config).length === 0) {
      return (
        <div className="py-4">
          <p className="text-muted-foreground">No configuration options available for this plugin.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {Object.entries(config).map(([key, value]) => {
          if (typeof value === 'boolean') {
            return (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-base">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Label>
                <Switch
                  id={key}
                  checked={value as boolean}
                  onCheckedChange={checked => handleInputChange(key, checked)}
                />
              </div>
            );
          }
          
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Label>
              <Input
                id={key}
                value={value as string}
                onChange={e => handleInputChange(key, e.target.value)}
                placeholder={`Enter ${key.split('_').join(' ')}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => navigate("/plugins")} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{pluginKey} Plugin</h1>
          <p className="text-muted-foreground">Configure and manage plugin settings</p>
        </div>
      </div>
      
      {!isActive && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Plugin is disabled</AlertTitle>
          <AlertDescription>
            This plugin is currently disabled. Enable it in the plugin marketplace to use its functionality.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Configuration</CardTitle>
              <CardDescription>Configure how the {pluginKey} plugin works in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              {renderConfigFields()}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleUninstall}>
                <Trash className="mr-2 h-4 w-4" />
                Disable Plugin
              </Button>
              <Button onClick={handleUpdateConfig} disabled={isConfiguring}>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>View how this plugin is being used in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visit the Plugin Analytics page to see detailed usage statistics.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/plugins/analytics")}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Learn how to use the {pluginKey} plugin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p>
                  The {pluginKey} plugin provides integration with {pluginKey} services, allowing you to 
                  {
                    pluginKey === 'stripe' ? ' process payments and manage subscriptions.' :
                    pluginKey === 'hubspot' ? ' sync contacts and manage your CRM.' :
                    pluginKey === 'shopify' ? ' manage products and process orders.' :
                    pluginKey === 'ga4' ? ' track analytics and generate reports.' :
                    pluginKey === 'twilio' ? ' send SMS notifications and alerts.' :
                    ' extend your application functionality.'
                  }
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Configure the plugin settings above</li>
                  <li>Test the connection by triggering a test event</li>
                  <li>Integrate the plugin into your workflows</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                <ul className="list-disc list-inside space-y-2">
                  {pluginKey === 'stripe' && (
                    <>
                      <li>Process payments securely</li>
                      <li>Manage subscriptions and billing cycles</li>
                      <li>Track payment analytics</li>
                    </>
                  )}
                  {pluginKey === 'hubspot' && (
                    <>
                      <li>Sync contacts automatically</li>
                      <li>Track lead engagement</li>
                      <li>Log activities and events</li>
                    </>
                  )}
                  {pluginKey === 'shopify' && (
                    <>
                      <li>Sync product inventory</li>
                      <li>Process orders automatically</li>
                      <li>Track shipping status</li>
                    </>
                  )}
                  {pluginKey === 'ga4' && (
                    <>
                      <li>Track user behavior</li>
                      <li>Generate custom reports</li>
                      <li>Monitor conversion goals</li>
                    </>
                  )}
                  {pluginKey === 'twilio' && (
                    <>
                      <li>Send SMS notifications</li>
                      <li>Set up automated reminders</li>
                      <li>Track delivery status</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
