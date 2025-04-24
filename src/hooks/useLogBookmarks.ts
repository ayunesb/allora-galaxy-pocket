
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';

interface LogBookmark {
  id: string;
  log_id: string;
  note: string;
  created_at: string;
}

export function useLogBookmarks() {
  const [bookmarks, setBookmarks] = useState<LogBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tenant } = useTenant();

  const fetchBookmarks = async () => {
    if (!tenant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('log_bookmarks')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to fetch bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const addBookmark = async (logId: string, note?: string) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('log_bookmarks')
        .insert({
          log_id: logId,
          tenant_id: tenant.id,
          note
        });

      if (error) throw error;
      toast.success('Log bookmarked successfully');
      fetchBookmarks();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error('Failed to bookmark log');
    }
  };

  const removeBookmark = async (logId: string) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('log_bookmarks')
        .delete()
        .eq('log_id', logId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      toast.success('Bookmark removed');
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  useEffect(() => {
    if (tenant?.id) {
      fetchBookmarks();
    }
  }, [tenant?.id]);

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark
  };
}
