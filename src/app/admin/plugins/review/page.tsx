
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { toast } from "sonner";

type PluginSubmission = {
  id: string;
  plugin_name: string;
  description: string;
  schema_sql: string;
  install_script: string;
  status: string;
  submitted_at: string;
  tenant_id: string;
};

export default function PluginReviewPanel() {
  const { isAdmin } = useRolePermissions();
  const [submissions, setSubmissions] = useState<PluginSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<string>("pending");

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("plugin_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) {
        toast.error("Failed to load submissions", {
          description: error.message,
        });
        return;
      }

      setSubmissions(data as PluginSubmission[]);
    };

    fetchSubmissions();
  }, [isAdmin]);

  const updateSubmissionStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("plugin_submissions")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) => 
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
      
      toast.success(`Plugin ${status}`, {
        description: `The plugin submission has been ${status}.`
      });
    } catch (error) {
      toast.error("Failed to update status", {
        description: (error as Error).message,
      });
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (activeTab === "pending") return s.status === "pending";
    if (activeTab === "approved") return s.status === "approved";
    if (activeTab === "rejected") return s.status === "rejected";
    return true;
  });

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-4">You need administrator permissions to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">🔍 Plugin Submission Review</h1>
      
      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6 space-y-6">
          {filteredSubmissions.length === 0 ? (
            <p className="text-muted-foreground">
              No {activeTab !== "all" ? activeTab : ""} submissions found.
            </p>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{submission.plugin_name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      submission.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      submission.status === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {submission.status}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Description</h3>
                    <p className="text-sm">{submission.description}</p>
                  </div>
                  
                  {submission.schema_sql && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Schema SQL</h3>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-32">
                        {submission.schema_sql}
                      </pre>
                    </div>
                  )}
                  
                  {submission.install_script && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Install Script</h3>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-32">
                        {submission.install_script}
                      </pre>
                    </div>
                  )}
                  
                  {submission.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => updateSubmissionStatus(submission.id, "approved")}
                        className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button 
                        onClick={() => updateSubmissionStatus(submission.id, "rejected")}
                        variant="destructive">
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
