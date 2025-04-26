
import React from 'react';
import { useStrategies } from './hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StrategyCard } from './components/StrategyCard';
import { EmptyStrategiesState } from './components/EmptyStrategiesState';
import { StrategyErrorBoundary } from './components/StrategyErrorBoundary';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StrategyPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, strategies, handleCreateStrategy, handleStrategySelect } = useStrategies();
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Marketing Strategies</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-muted rounded-full mb-3"></div>
            <div className="h-4 w-32 bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <StrategyErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Marketing Strategies</h1>
          <Button 
            onClick={() => navigate('/strategy-gen')}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Strategy
          </Button>
        </div>
        
        {strategies && strategies.length > 0 ? (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search strategies..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex gap-2">
                  <Filter size={16} />
                  More Filters
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategies.map((strategy) => (
                <StrategyCard 
                  key={strategy.id} 
                  strategy={strategy} 
                  onClick={handleStrategySelect} 
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyStrategiesState onCreateStrategy={handleCreateStrategy} />
        )}
      </div>
    </StrategyErrorBoundary>
  );
};

export default StrategyPage;
