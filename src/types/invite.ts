
export type UserRole = "admin" | "editor" | "viewer" | "manager";

export interface InviteCreateRequest {
  email: string;
  role: UserRole;
}

export interface Invite {
  id: string;
  tenant_id: string;
  email: string;
  role: UserRole;
  created_at: string;
  expires_at: string;
  accepted?: string | null;
  token: string;
}
