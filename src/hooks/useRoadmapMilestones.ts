
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  description?: string;
}

export function useRoadmapMilestones() {
  const { tenant } = useTenant();
  
  const query = useQuery({
    queryKey: ['strategic-milestones', tenant?.id],
    queryFn: async (): Promise<Milestone[]> => {
      if (!tenant?.id) return [];
      
      try {
        // In a real implementation, you would fetch this from the database
        // For now we're using static data for demonstration
        
        // This could be replaced with:
        // const { data, error } = await supabase
        //   .from('strategy_milestones')
        //   .select('*')
        //   .eq('tenant_id', tenant.id)
        //   .order('due_date', { ascending: true });
        
        return [
          { 
            id: '1', 
            title: 'Complete Onboarding', 
            completed: true,
            dueDate: '2025-01-15',
            description: 'Set up company profile and team members'
          },
          { 
            id: '2', 
            title: 'Create First Strategy', 
            completed: true,
            dueDate: '2025-02-01',
            description: 'Develop initial market approach strategy'
          },
          { 
            id: '3', 
            title: 'Launch Initial Campaign', 
            completed: false,
            dueDate: '2025-02-15',
            description: 'Execute first marketing campaign'
          },
          { 
            id: '4', 
            title: 'Integrate Analytics', 
            completed: false,
            dueDate: '2025-03-01',
            description: 'Connect data sources and set up tracking'
          },
          { 
            id: '5', 
            title: 'Evaluate First Results', 
            completed: false,
            dueDate: '2025-03-15',
            description: 'Analyze campaign performance and adjust strategy'
          }
        ];
      } catch (error) {
        console.error('Error fetching strategic milestones:', error);
        return [];
      }
    },
    enabled: !!tenant?.id
  });
  
  const milestones = query.data || [];
  
  // Calculate overall progress
  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.length;
  const overallProgress = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  return {
    milestones,
    isLoading: query.isLoading,
    error: query.error,
    completedCount,
    totalCount,
    overallProgress,
    refetch: query.refetch
  };
}
