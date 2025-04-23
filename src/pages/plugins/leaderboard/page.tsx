"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, BadgeInfo, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PluginLeaderboardPage() {
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("plugin_submissions")
        .select("*")
        .eq("is_public", true)
        .order("installs", { ascending: false });
      setPlugins(data || []);
    };
    fetch();
  }, []);

  const top3Ids =
    plugins
      .slice() // do not mutate
      .sort((a, b) => (b.installs ?? 0) - (a.installs ?? 0))
      .slice(0, 3)
      .map((p) => p.id);

  const now = Date.now();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔌 Plugin Leaderboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((p, i) => {
          const isMostInstalled = top3Ids.includes(p.id);
          const isNew =
            p.created_at &&
            now - new Date(p.created_at).getTime() < 7 * 86400000;
          const isRemixed = (p.remix_count ?? 0) >= 3;

          return (
            <div
              key={p.id}
              className="border rounded-xl p-4 bg-background shadow-sm flex flex-col gap-2"
            >
              <div className="flex flex-wrap gap-2 items-center mb-1">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                {isMostInstalled && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Most Installed
                  </Badge>
                )}
                {isNew && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BadgeInfo className="w-4 h-4 text-blue-500" />
                    New
                  </Badge>
                )}
                {isRemixed && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Repeat className="w-4 h-4 text-green-600" />
                    Remixed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="flex items-center gap-4 text-xs mt-2">
                <span>
                  Installs: <b>{p.installs ?? 0}</b>
                </span>
                <span>
                  Remixes: <b>{p.remix_count ?? 0}</b>
                </span>
              </div>
              <a
                href={`/plugins/remix/${p.id}`}
                className="text-primary text-sm mt-2 hover:underline"
              >
                🔁 Remix
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
