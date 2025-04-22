
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { Star } from "lucide-react";

type Plugin = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  version: string;
  author: string;
  icon_url?: string;
  changelog?: any[];
  category?: string;
};

export default function PluginExplorePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { tenant } = useTenant();
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [pluginReviews, setPluginReviews] = useState<{[key: string]: {avgRating: number, count: number}}>({});

  useEffect(() => {
    const fetchPlugins = async () => {
      const { data, error } = await supabase.from("plugins").select("*");
      if (error) {
        toast.error("Failed to load plugins", {
          description: error.message
        });
      } else if (data) {
        setPlugins(data);
        
        const ratingPromises = data.map(async (plugin) => {
          const { data: reviews } = await supabase
            .from("plugin_reviews")
            .select("rating")
            .eq("plugin_id", plugin.id);
          
          const avgRating = reviews?.length 
            ? Number((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)) 
            : 0;
          
          return {
            [plugin.id]: {
              avgRating,
              count: reviews?.length || 0
            }
          };
        });

        const ratingResults = await Promise.all(ratingPromises);
        const ratingsMap = ratingResults.reduce((acc, curr) => ({...acc, ...curr}), {});
        setPluginReviews(ratingsMap);
      }
    };

    fetchPlugins();
  }, []);

  const installPlugin = async (pluginId: string) => {
    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }

    const { error } = await supabase.from("plugin_installs").insert({
      tenant_id: tenant.id,
      plugin_id: pluginId,
      enabled: true,
      last_checked_version: null
    });

    if (error) {
      toast.error("Failed to install plugin", {
        description: error.message
      });
    } else {
      toast.success("Plugin installed successfully");
    }
  };

  const submitReview = async () => {
    if (!tenant?.id || !selectedPlugin) return;

    try {
      const { error } = await supabase.from("plugin_reviews").upsert({
        plugin_id: selectedPlugin.id,
        tenant_id: tenant.id,
        rating,
        review
      });

      if (error) throw error;

      toast.success("Review submitted successfully");
      setSelectedPlugin(null);
      setRating(5);
      setReview("");
    } catch (error) {
      toast.error("Failed to submit review", {
        description: (error as Error).message
      });
    }
  };

  const suggestedPlugins = plugins.filter(p => 
    p.name === "Stripe" || 
    p.name === "HubSpot" || 
    p.name === "Twilio"
  );

  const filteredPlugins = category 
    ? plugins.filter(p => p.category === category)
    : plugins;

  return (
    <div className="container mx-auto py-8 px-4 bg-background text-foreground dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary dark:text-white">🛒 Plugin Marketplace</h1>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4 text-foreground dark:text-gray-200">🧠 AI Suggested Plugins</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {suggestedPlugins.map((plugin) => (
            <Card 
              key={plugin.id} 
              className="flex flex-col bg-card dark:bg-gray-800 border border-border dark:border-gray-700"
            >
              <CardHeader className="flex-row items-center space-x-4">
                {plugin.icon_url && (
                  <img 
                    src={plugin.icon_url} 
                    alt={`${plugin.name} icon`} 
                    className="w-12 h-12 rounded-lg" 
                  />
                )}
                <div>
                  <CardTitle className="text-foreground dark:text-white">{plugin.name}</CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{plugin.description}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label 
          htmlFor="category-select" 
          className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2"
        >
          Filter by Category
        </label>
        <select 
          id="category-select"
          className="w-full border rounded p-2 bg-background dark:bg-gray-800 text-foreground dark:text-white border-border dark:border-gray-700"
          value={category || ''}
          onChange={(e) => setCategory(e.target.value || null)}
        >
          <option value="">All Categories</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Automation">Automation</option>
          <option value="Analytics">Analytics</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin) => (
          <Card 
            key={plugin.id} 
            className="flex flex-col bg-card dark:bg-gray-800 border border-border dark:border-gray-700"
          >
            <CardHeader className="flex-row items-center justify-between space-y-0 space-x-4">
              <div className="flex items-center space-x-4">
                {plugin.icon_url && (
                  <img 
                    src={plugin.icon_url} 
                    alt={`${plugin.name} icon`} 
                    className="w-12 h-12 rounded-lg" 
                  />
                )}
                <div>
                  <CardTitle className="text-foreground dark:text-white">{plugin.name}</CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{plugin.version}</p>
                </div>
              </div>
              {plugin.category && (
                <span 
                  className={`text-xs px-2 py-1 rounded-full text-white ${
                    plugin.category === 'Marketing' ? 'bg-blue-600' :
                    plugin.category === 'Sales' ? 'bg-green-600' :
                    plugin.category === 'Automation' ? 'bg-purple-600' :
                    'bg-gray-600'
                  }`}
                >
                  {plugin.category}
                </span>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                {plugin.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(pluginReviews[plugin.id]?.avgRating || 0) 
                          ? "text-yellow-500" 
                          : "text-gray-300 dark:text-gray-600"
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    {pluginReviews[plugin.id]?.avgRating || 'No'} 
                    {` (${pluginReviews[plugin.id]?.count || 0} reviews)`}
                  </span>
                </div>
                <Button 
                  variant="default" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => installPlugin(plugin.id)}
                >
                  Install
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-foreground dark:text-white border-border dark:border-gray-700 hover:bg-accent dark:hover:bg-gray-700"
                onClick={() => setSelectedPlugin(plugin)}
              >
                Write a Review
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white">Review {selectedPlugin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                {[1,2,3,4,5].map((num) => (
                  <Star 
                    key={num} 
                    className={`w-6 h-6 cursor-pointer ${
                      num <= rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"
                    }`}
                    onClick={() => setRating(num)}
                  />
                ))}
                <span className="text-sm text-foreground dark:text-white">{rating} / 5</span>
              </div>
              <textarea 
                placeholder="Write your review..." 
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border rounded p-2 mb-4 bg-background dark:bg-gray-900 text-foreground dark:text-white border-border dark:border-gray-700"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  className="text-foreground dark:text-white border-border dark:border-gray-700"
                  onClick={() => setSelectedPlugin(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitReview}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
