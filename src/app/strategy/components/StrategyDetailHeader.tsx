
import React from 'react';
import { Strategy } from '@/types/strategy';
import { StrategyHeader } from './StrategyHeader';
import { useNavigate } from 'react-router-dom';

interface StrategyDetailHeaderProps {
  strategy: Strategy;
}

export function StrategyDetailHeader({ strategy }: StrategyDetailHeaderProps) {
  const navigate = useNavigate();
  
  const handleShare = () => {
    console.log('Sharing strategy:', strategy.id);
    // Implement share functionality
  };
  
  const handleExport = () => {
    console.log('Exporting strategy:', strategy.id);
    // Implement export functionality
  };
  
  const handleDelete = () => {
    console.log('Delete strategy:', strategy.id);
    // Implement delete functionality
  };
  
  return (
    <StrategyHeader 
      strategy={strategy}
      onShare={handleShare}
      onExport={handleExport}
      onDelete={handleDelete}
      onNavigate={navigate}
    />
  );
}
