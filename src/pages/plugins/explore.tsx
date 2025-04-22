import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { SuggestedPlugins } from "./explore/SuggestedPlugins";
import { PluginCategoryFilter } from "./explore/PluginCategoryFilter";
import { PluginCard } from "./explore/PluginCard";
import { PluginReviewModal } from "./explore/PluginReviewModal";

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
      
      <SuggestedPlugins suggestedPlugins={suggestedPlugins} />

      <PluginCategoryFilter value={category} onChange={setCategory} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map((plugin) => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            avgRating={pluginReviews[plugin.id]?.avgRating}
            reviewCount={pluginReviews[plugin.id]?.count}
            onInstall={installPlugin}
            onReview={() => setSelectedPlugin(plugin)}
          />
        ))}
      </div>

      <PluginReviewModal
        open={!!selectedPlugin}
        plugin={selectedPlugin}
        rating={rating}
        setRating={setRating}
        review={review}
        setReview={setReview}
        onClose={() => setSelectedPlugin(null)}
        onSubmit={submitReview}
      />
    </div>
  );
}
