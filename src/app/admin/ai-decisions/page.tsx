'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Decision } from '@/types/decisions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function AIDecisionsPage() {
  const [aiDecisions, setAiDecisions] = useState<Decision[]>([]);
  const [humanDecisions, setHumanDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDecisions = async () => {
    try {
      // Use direct query instead of non-existent RPC
      const { data, error } = await supabase
        .from('decisions')
        .select('*, strategies(*)')
        .eq('auto_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to match the expected format
      return data as Decision[];
    } catch (error) {
      console.error('Error fetching AI decisions:', error);
      throw error;
    }
  };

  const fetchHumanDecisions = async () => {
    try {
      // Use direct query instead of non-existent RPC
      const { data, error } = await supabase
        .from('decisions')
        .select('*, strategies(*)')
        .eq('auto_approved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to match the expected format
      return data as Decision[];
    } catch (error) {
      console.error('Error fetching human decisions:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">AI Decisions Dashboard</h1>

      <Tabs defaultvalue="ai">
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
                <p>Loading AI approved decisions...</p>
              ) : (
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
                <p>Loading human approved decisions...</p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
