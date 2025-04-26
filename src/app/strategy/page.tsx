
import React from 'react';
import { useStrategies } from './hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StrategyCard } from './components/StrategyCard';
import { EmptyStrategiesState } from './components/EmptyStrategiesState';
import { StrategyErrorBoundary } from './components/StrategyErrorBoundary';

const StrategyPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, strategies, handleCreateStrategy, handleStrategySelect } = useStrategies();
  
  if (loading) {
    return <div className="p-8 text-center">Loading strategies...</div>;
  }
  
  return (
    <StrategyErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Marketing Strategies</h1>
          <Button 
            onClick={() => navigate('/strategy-gen')}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Strategy
          </Button>
        </div>
        
        {strategies && strategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <StrategyCard 
                key={strategy.id} 
                strategy={strategy} 
                onClick={handleStrategySelect} 
              />
            ))}
          </div>
        ) : (
          <EmptyStrategiesState onCreateStrategy={handleCreateStrategy} />
        )}
      </div>
    </StrategyErrorBoundary>
  );
};

export default StrategyPage;
