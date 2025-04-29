
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Strategy } from '@/types/strategy';

interface StrategyApprovalFlowProps {
  strategyId: string;
}

export const StrategyApprovalFlow = ({ strategyId }: StrategyApprovalFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  const handleLoadStrategy = async () => {
    setIsLoading(true);
    try {
      // Fetch strategy data
      const response = await fetch(`/api/strategies/${strategyId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load strategy: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Safely cast the data to Strategy type
      setStrategy(data as Strategy);
    } catch (error) {
      console.error('Error loading strategy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Strategy Approval</h2>
      <Button 
        onClick={handleLoadStrategy} 
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Load Strategy'}
      </Button>
      
      {strategy && (
        <div className="border p-4 rounded-md">
          <p className="font-medium">Strategy loaded successfully</p>
          <div className="mt-2">
            <p><strong>Title:</strong> {strategy.title}</p>
            <p><strong>Status:</strong> {strategy.status}</p>
            {strategy.description && (
              <p><strong>Description:</strong> {strategy.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyApprovalFlow;
