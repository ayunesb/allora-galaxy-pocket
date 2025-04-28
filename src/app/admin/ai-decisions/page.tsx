
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ErrorAlert from "@/components/ui/ErrorAlert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Decision {
  id: string;
  strategy_id: string;
  strategy_title?: string;
  title?: string;
  decision: string;
  confidence_score: number;
  auto_approved: boolean;
  decision_made_at: string;
  created_at: string;
}

export default function AIDecisionsPage() {
  const [aiDecisions, setAiDecisions] = useState<Decision[]>([]);
  const [humanDecisions, setHumanDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const ai = await fetchDecisions();
        const human = await fetchHumanDecisions();
        setAiDecisions(ai);
        setHumanDecisions(human);
      } catch (error) {
        console.error("Error fetching decisions:", error);
        setError(error instanceof Error ? error : new Error("Failed to fetch decisions"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDecisions = async () => {
    try {
      // Use strategies table with filter instead of non-existent decisions table
      const { data, error } = await supabase
        .from('strategies')
        .select('*, id, title, auto_approved, created_at')
        .eq('auto_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map strategies to match the expected Decision format
      return data.map(strategy => ({
        id: strategy.id,
        strategy_id: strategy.id,
        strategy_title: strategy.title,
        decision: `Strategy "${strategy.title}" was approved`,
        confidence_score: strategy.impact_score || 0,
        auto_approved: strategy.auto_approved,
        decision_made_at: strategy.approved_at || strategy.created_at,
        created_at: strategy.created_at
      })) as Decision[];
    } catch (error) {
      console.error('Error fetching AI decisions:', error);
      throw error;
    }
  };

  const fetchHumanDecisions = async () => {
    try {
      // Use strategies table with filter instead of non-existent decisions table
      const { data, error } = await supabase
        .from('strategies')
        .select('*, id, title, auto_approved, created_at')
        .eq('auto_approved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map strategies to match the expected Decision format
      return data.map(strategy => ({
        id: strategy.id,
        strategy_id: strategy.id,
        strategy_title: strategy.title,
        decision: `Strategy "${strategy.title}" was human approved`,
        confidence_score: strategy.impact_score || 0,
        auto_approved: strategy.auto_approved,
        decision_made_at: strategy.approved_at || strategy.created_at,
        created_at: strategy.created_at
      })) as Decision[];
    } catch (error) {
      console.error('Error fetching human decisions:', error);
      throw error;
    }
  };

  if (error) {
    return <ErrorAlert 
      title="Failed to load decisions" 
      description={error.message}
      onRetry={() => window.location.reload()}
    />;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">AI Decisions Dashboard</h1>

      <Tabs defaultValue="ai">
        <TabsList className="mb-4">
          <TabsTrigger value="ai">AI Approved</TabsTrigger>
          <TabsTrigger value="human">Human Approved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Approved Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" label="Loading AI decisions..." />
                </div>
              ) : aiDecisions.length > 0 ? (
                <div className="grid gap-4">
                  {aiDecisions.map((decision) => (
                    <div key={decision.id} className="border rounded-md p-4">
                      <p>
                        <strong>Decision:</strong> {decision.decision}
                      </p>
                      <p>
                        <strong>Strategy:</strong> {decision.strategy_title || decision.strategy_id}
                      </p>
                      <p>
                        <strong>Confidence:</strong> {decision.confidence_score}
                      </p>
                      <p>
                        <strong>Made at:</strong> {decision.decision_made_at}
                      </p>
                      <Badge className="mt-2">Auto Approved</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No AI approved decisions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="human">
          <Card>
            <CardHeader>
              <CardTitle>Human Approved Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" label="Loading human decisions..." />
                </div>
              ) : humanDecisions.length > 0 ? (
                <div className="grid gap-4">
                  {humanDecisions.map((decision) => (
                    <div key={decision.id} className="border rounded-md p-4">
                      <p>
                        <strong>Decision:</strong> {decision.decision}
                      </p>
                      <p>
                        <strong>Strategy:</strong> {decision.strategy_title || decision.strategy_id}
                      </p>
                      <p>
                        <strong>Confidence:</strong> {decision.confidence_score}
                      </p>
                      <p>
                        <strong>Made at:</strong> {decision.decision_made_at}
                      </p>
                      <Badge className="mt-2">Human Approved</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No human approved decisions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
