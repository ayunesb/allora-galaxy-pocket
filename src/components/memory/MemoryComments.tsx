
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MemoryCommentsProps {
  memoryId: string;
}

export function MemoryComments({ memoryId }: MemoryCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['memory-comments', memoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('memory_comments')
        .select(`
          id,
          comment,
          created_at,
          user_id,
          profiles(avatar_url)
        `)
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const submitComment = useMutation({
    mutationFn: async (comment: string) => {
      const { error } = await supabase
        .from('memory_comments')
        .insert({ memory_id: memoryId, comment });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ['memory-comments', memoryId] });
      toast.success("Comment posted successfully");
    },
    onError: () => {
      toast.error("Failed to post comment");
    }
  });

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm">
        💬 Comments ({comments.length})
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2 items-start">
            <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0" />
            <div>
              <p className="text-sm">{c.comment}</p>
            </div>
          </div>
        ))}
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <Button 
            onClick={() => submitComment.mutate(newComment)}
            disabled={!newComment.trim() || submitComment.isPending}
          >
            Post
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
