
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgentMemoryFilter } from './components/AgentMemoryFilter';
import { AgentMemoryList } from './components/AgentMemoryList';
import { RemixLeaderboard } from '@/components/memory/RemixLeaderboard';
import { AgentMemory } from '@/types/agent';

export default function AcademyPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'xp'>('date');

  const { data: memories, isLoading } = useQuery({
    queryKey: ['agent-memories', selectedAgent, selectedTag, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('agent_memory')
        .select('*')
        .order(sortBy === 'date' ? 'timestamp' : 'xp_delta', { ascending: false });

      if (selectedAgent) {
        query = query.eq('agent_name', selectedAgent);
      }
      
      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }
      
      if (searchQuery) {
        query = query.ilike('context', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Ensure all memories have summary and tags
      return (data || []).map(item => ({
        ...item,
        summary: item.summary || item.context.substring(0, 100) + (item.context.length > 100 ? "..." : ""),
        tags: item.tags || []
      })) as AgentMemory[];
    }
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Memory Academy</h1>
        <p className="text-muted-foreground">
          Learn from successful strategies and proven tactics
        </p>
      </header>

      <RemixLeaderboard />

      <AgentMemoryFilter
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <AgentMemoryList 
        memories={memories || []} 
        isLoading={isLoading}
      />
    </div>
  );
}
