
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy, StrategyVersion } from '@/types/strategy';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export function useStrategyDetail(strategyId: string) {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [versions, setVersions] = useState<StrategyVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load strategy details and version history
  const fetchStrategyDetail = useCallback(async () => {
    if (!strategyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch strategy details
      const { data: strategyData, error: strategyError } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .single();
      
      if (strategyError) throw strategyError;
      
      if (!strategyData) {
        throw new Error('Strategy not found');
      }
      
      setStrategy(strategyData as Strategy);
      
      // Fetch strategy versions
      const { data: versionData, error: versionError } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('version', { ascending: false });
      
      if (versionError) throw versionError;
      
      setVersions(versionData as StrategyVersion[]);
      
    } catch (err: any) {
      console.error('Error fetching strategy details:', err);
      setError(err.message || 'Failed to load strategy details');
      toast.error('Failed to load strategy details');
    } finally {
      setIsLoading(false);
    }
  }, [strategyId]);

  // Create a new version of the strategy
  const createNewVersion = useCallback(async (comment: string) => {
    if (!strategy || !user) {
      toast.error('Cannot create version: missing strategy or user data');
      return;
    }
    
    try {
      // Determine next version number
      const nextVersion = versions.length > 0 
        ? Math.max(...versions.map(v => v.version)) + 1 
        : 1;
      
      // Create new version record
      const { error } = await supabase
        .from('strategy_versions')
        .insert({
          strategy_id: strategy.id,
          version: nextVersion,
          data: strategy,
          created_by: user.id,
          comment
        });
      
      if (error) throw error;
      
      toast.success('New version created successfully');
      
      // Refresh versions list
      fetchStrategyDetail();
      
    } catch (err: any) {
      console.error('Error creating new version:', err);
      toast.error('Failed to create new version');
      throw err;
    }
  }, [strategy, user, versions, fetchStrategyDetail]);

  // Compare two versions and calculate differences
  const compareVersions = useCallback(async (v1: StrategyVersion, v2: StrategyVersion) => {
    // Add comparison logic here if needed
    console.log('Comparing versions:', v1.version, v2.version);
  }, []);

  // Load data on component mount or when strategyId changes
  useEffect(() => {
    fetchStrategyDetail();
  }, [fetchStrategyDetail]);

  return {
    strategy,
    versions,
    isLoading,
    error,
    createNewVersion,
    compareVersions,
    refresh: fetchStrategyDetail
  };
}
