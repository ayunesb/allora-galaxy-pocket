
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { usePlugins } from "@/hooks/usePlugins";
import { Package, Activity, Settings, Database, TrendingUp } from "lucide-react";

export default function PluginsDashboard() {
  const { activePlugins, isLoading } = usePlugins();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plugins</h1>
          <p className="text-muted-foreground">
            Manage and configure plugins to extend your workspace
          </p>
        </div>
        <Button onClick={() => navigate("/plugins/marketplace")}>
          <Package className="mr-2 h-4 w-4" />
          Browse Marketplace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : activePlugins.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold pt-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Package className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Marketplace</CardTitle>
            <CardDescription>Browse and install plugins</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/plugins/marketplace")}
            >
              View Marketplace
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Activity className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View plugin usage statistics</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/plugins/analytics")}
            >
              View Analytics
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Settings className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure global plugin settings</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/plugins/settings")}
            >
              Plugin Settings
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Database className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>My Plugins</CardTitle>
            <CardDescription>Manage your installed plugins</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/plugins/my")}
            >
              View My Plugins
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-2xl font-bold pt-4">Active Plugins</h2>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activePlugins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No active plugins</h3>
            <p className="text-muted-foreground mb-4">Get started by installing plugins from the marketplace</p>
            <Button onClick={() => navigate("/plugins/marketplace")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePlugins.map(plugin => (
            <Card key={plugin} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{plugin}</CardTitle>
                <CardDescription>Active</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/plugins/config/${plugin}`)}
                >
                  Configure
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
