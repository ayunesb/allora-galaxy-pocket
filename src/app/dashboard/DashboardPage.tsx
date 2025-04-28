
import React from "react";
import { useStrategyAndCampaigns } from "./hooks/useStrategyAndCampaigns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Strategy } from "@/types/strategy";
import { Campaign, ExecutionStatus } from "@/types/campaign";

export default function DashboardPage() {
  const { strategies, campaigns } = useStrategyAndCampaigns();

  // Type-safe handling of strategy and campaign data with proper typing
  const typedStrategies: Strategy[] = strategies?.map(strategy => ({
    ...strategy,
    status: strategy.status as Strategy['status'],
    metrics_baseline: strategy.metrics_baseline as Record<string, any>,
    diagnosis: strategy.diagnosis as Record<string, any>,
    onboarding_data: strategy.onboarding_data as Record<string, any>
  })) || [];

  const typedCampaigns: Campaign[] = campaigns?.map(campaign => ({
    ...campaign,
    status: campaign.status as Campaign['status'],
    execution_status: campaign.execution_status as ExecutionStatus,
    scripts: campaign.scripts as Record<string, string>,
    execution_metrics: campaign.execution_metrics as Record<string, any>
  })) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Strategies</h2>
          {!strategies ? (
            <LoadingSpinner />
          ) : strategies.length === 0 ? (
            <p className="text-muted-foreground">No strategies found</p>
          ) : (
            <div className="space-y-4">
              {typedStrategies.map((strategy) => (
                <div 
                  key={strategy.id} 
                  className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <h3 className="font-medium">{strategy.title || "Untitled Strategy"}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {strategy.description || "No description"}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(strategy.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {strategy.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
          {!campaigns ? (
            <LoadingSpinner />
          ) : campaigns.length === 0 ? (
            <p className="text-muted-foreground">No campaigns found</p>
          ) : (
            <div className="space-y-4">
              {typedCampaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <h3 className="font-medium">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.description || "No description"}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
        <div className="p-6 border rounded-lg bg-slate-50 text-center">
          <p className="text-muted-foreground">Performance metrics will appear here</p>
        </div>
      </div>
    </div>
  );
}
