
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface LogBookmark {
  id: string;
  log_id: string;
  user_id: string;
  tenant_id: string;
  note: string | null;
  created_at: string;
}

export function useLogBookmarks() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['log-bookmarks', tenant?.id],
    queryFn: async () => {
      if (!user || !tenant) return [];
      
      const { data, error } = await supabase
        .from('log_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as LogBookmark[];
    },
    enabled: !!user && !!tenant,
  });
  
  const addBookmark = useMutation({
    mutationFn: async ({ logId, note }: { logId: string; note?: string }) => {
      if (!user || !tenant) {
        throw new Error('User or tenant not available');
      }
      
      const { data, error } = await supabase
        .from('log_bookmarks')
        .insert({
          log_id: logId,
          user_id: user.id,
          tenant_id: tenant.id,
          note: note || null
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-bookmarks'] });
      toast.success('Log bookmarked successfully');
    },
    onError: (error) => {
      toast.error('Failed to bookmark log', { description: error.message });
    }
  });
  
  const deleteBookmark = useMutation({
    mutationFn: async (bookmarkId: string) => {
      const { error } = await supabase
        .from('log_bookmarks')
        .delete()
        .eq('id', bookmarkId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['log-bookmarks'] });
      toast.success('Bookmark removed');
    },
    onError: (error) => {
      toast.error('Failed to remove bookmark', { description: error.message });
    }
  });
  
  const isLogBookmarked = (logId: string): boolean => {
    return !!bookmarks?.some(bookmark => bookmark.log_id === logId);
  };
  
  const getBookmarkForLog = (logId: string): LogBookmark | undefined => {
    return bookmarks?.find(bookmark => bookmark.log_id === logId);
  };
  
  return {
    bookmarks,
    isLoading,
    addBookmark,
    deleteBookmark,
    isLogBookmarked,
    getBookmarkForLog,
    selectedLogId,
    setSelectedLogId
  };
}
