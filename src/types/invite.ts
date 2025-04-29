
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Invite {
  id: string;
  tenant_id: string;
  email: string;
  role: UserRole;
  created_at: string;
  invitation_code: string;
  expires_at: string;
  accepted_at: string | null;
  created_by: string | null;
}
