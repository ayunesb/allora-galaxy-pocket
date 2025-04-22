
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
};

export default function PluginExplorePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { tenant } = useTenant();
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
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
        
        // Fetch average ratings for each plugin
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
      last_checked_version: null // Reset last checked version on new install
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛒 Plugin Marketplace</h1>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="flex flex-col">
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
                  <CardTitle>{plugin.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plugin.version}</p>
                </div>
              </div>
              {plugin.badge && (
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${
                    plugin.badge === "Top Rated" ? "bg-green-300" :
                    plugin.badge === "Most Used" ? "bg-purple-300" :
                    "bg-yellow-300"
                  }`}
                >
                  {plugin.badge}
                </span>
              )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-4">
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
                          : "text-gray-300"
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">
                    {pluginReviews[plugin.id]?.avgRating || 'No'} 
                    {` (${pluginReviews[plugin.id]?.count || 0} reviews)`}
                </span>
                </div>
                <Button onClick={() => installPlugin(plugin.id)}>
                  Install
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => setSelectedPlugin(plugin)}
              >
                Write a Review
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <CardHeader>
              <CardTitle>Review {selectedPlugin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                {[1,2,3,4,5].map((num) => (
                  <Star 
                    key={num} 
                    className={`w-6 h-6 cursor-pointer ${
                      num <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setRating(num)}
                  />
                ))}
                <span className="text-sm">{rating} / 5</span>
              </div>
              <textarea 
                placeholder="Write your review..." 
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPlugin(null)}
                >
                  Cancel
                </Button>
                <Button onClick={submitReview}>
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
