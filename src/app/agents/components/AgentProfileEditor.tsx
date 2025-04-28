
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useUpdateAgentProfile } from '../hooks/useUpdateAgentProfile';
import { useTenant } from '@/hooks/useTenant';
import { toast } from 'sonner';
import { AgentProfile } from '@/types/agent';

interface AgentProfileEditorProps {
  agent: AgentProfile;
  onSave?: () => void;
}

export default function AgentProfileEditor({ agent, onSave }: AgentProfileEditorProps) {
  const { tenant } = useTenant();
  const [profile, setProfile] = useState({
    agent_name: agent.agent_name,
    role: agent.role,
    tone: agent.tone,
    language: agent.language,
    avatar_url: agent.avatar_url || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateProfile } = useUpdateAgentProfile();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant) {
      toast.error('No active workspace selected');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        id: agent.id,
        profileData: {
          ...profile
        }
      });
      toast.success('Agent profile updated');
      if (onSave) onSave();
    } catch (error) {
      console.error('Error updating agent profile:', error);
      toast.error('Failed to update agent profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label htmlFor="agent_name" className="block text-sm font-medium mb-1">Name</label>
            <Input
              id="agent_name"
              name="agent_name"
              value={profile.agent_name}
              onChange={handleChange}
              required
              disabled={isUpdating}
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
            <Input
              id="role"
              name="role"
              value={profile.role}
              onChange={handleChange}
              required
              disabled={isUpdating}
            />
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium mb-1">Tone</label>
            <Textarea
              id="tone"
              name="tone"
              value={profile.tone}
              onChange={handleChange}
              required
              disabled={isUpdating}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium mb-1">Language</label>
            <Input
              id="language"
              name="language"
              value={profile.language}
              onChange={handleChange}
              required
              disabled={isUpdating}
            />
          </div>

          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium mb-1">Avatar URL (optional)</label>
            <Input
              id="avatar_url"
              name="avatar_url"
              value={profile.avatar_url}
              onChange={handleChange}
              disabled={isUpdating}
              placeholder="https://example.com/avatar.png"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
