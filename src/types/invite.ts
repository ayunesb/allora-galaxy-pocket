
import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface TeamInvite {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  created_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  created_by: string | null;
}
