
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';
import { transformStrategyData, transformStrategyArray } from '@/utils/dataTransformers';

export function useStrategy(strategyId?: string) {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!strategyId) return;

    const fetchStrategy = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .single();

        if (error) throw error;
        
        if (data) {
          setStrategy(transformStrategyData(data));
        }
      } catch (err: any) {
        setError(err);
        console.error('Error fetching strategy:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [strategyId]);

  return { strategy, loading, error };
}

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStrategies = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setStrategies(transformStrategyArray(data));
      }
    } catch (err: any) {
      setError(err);
      console.error('Error fetching strategies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return { strategies, loading, error, refetch: fetchStrategies };
}
