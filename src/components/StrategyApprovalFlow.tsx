
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mapJsonToStrategy } from '@/types/strategy';

interface StrategyApprovalFlowProps {
  strategyId: string;
}

export const StrategyApprovalFlow = ({ strategyId }: StrategyApprovalFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const handleLoadStrategy = async () => {
    setIsLoading(true);
    try {
      // Fetch strategy data
      const response = await fetch(`/api/strategies/${strategyId}`);
      const data = await response.json();
      
      // Use the mapping function to convert API data to Strategy type
      const mappedStrategy = mapJsonToStrategy(data);
      setStrategy(mappedStrategy);
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
        </div>
      )}
    </div>
  );
};

export default StrategyApprovalFlow;
