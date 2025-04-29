
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  created_at: string;
  expires_at: string;
  invitation_code: string;
  accepted_at?: string;
  created_by?: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: UserRole;
  tenant_id: string;
  created_at: string;
  profiles: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}
