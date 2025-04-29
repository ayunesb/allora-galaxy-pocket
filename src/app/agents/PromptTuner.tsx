
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export default function PromptTuner() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { logActivity } = useSystemLogs();

  useEffect(() => {
    // Log component access when mounted
    logActivity('PROMPT_TUNER_VIEW', 'Prompt tuner accessed');
  }, [logActivity]);

  const handleTune = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set a mock response
      setResponse("Strategy generated successfully");
      
      // Log the tuning activity with positional parameters
      logActivity(
        'PROMPT_TUNED',
        'Prompt tuning completed successfully',
        { promptLength: prompt.length }
      );
    } catch (error) {
      console.error('Tuning error:', error);
      setResponse('Error tuning prompt');
      
      logActivity(
        'PROMPT_TUNE_ERROR',
        'Prompt tuning failed',
        { error: String(error) }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Prompt Tuner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Enter your prompt</label>
            <Textarea
              placeholder="System, you are a helpful assistant..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
            />
          </div>
          
          <Button 
            onClick={handleTune} 
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? 'Tuning...' : 'Tune Prompt'}
          </Button>
          
          {response && (
            <div className="mt-4 p-4 border rounded bg-muted">
              <h3 className="text-sm font-medium mb-2">Response:</h3>
              <div className="text-sm">{response}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
