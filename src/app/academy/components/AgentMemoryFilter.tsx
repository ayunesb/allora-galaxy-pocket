
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AgentMemoryFilterProps {
  selectedAgent: string | null;
  setSelectedAgent: (agent: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'date' | 'xp';
  setSortBy: (sort: 'date' | 'xp') => void;
}

const agents = ['GrowthAgent', 'MarketingAgent', 'OpsAgent'];
const commonTags = ['email', 'offer', 'automation', 'retention', 'acquisition'];

export function AgentMemoryFilter({
  selectedAgent,
  setSelectedAgent,
  selectedTag,
  setSelectedTag,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy
}: AgentMemoryFilterProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as 'date' | 'xp')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Latest First</SelectItem>
            <SelectItem value="xp">Highest XP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => (
          <Badge
            key={agent}
            variant={selectedAgent === agent ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedAgent(selectedAgent === agent ? null : agent)}
          >
            {agent}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {commonTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
          >
            #{tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
