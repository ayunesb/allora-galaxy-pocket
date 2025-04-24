
import { vi } from 'vitest';

export const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ 
      subscription: { unsubscribe: vi.fn() }
    }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn()
  },
  rpc: vi.fn().mockImplementation((functionName: string, params: any) => {
    // Mock RPC responses
    if (functionName === 'check_tenant_role_permission') {
      return Promise.resolve({ data: false });  // Default to no access
    }
    if (functionName === 'get_user_role_for_tenant') {
      return Promise.resolve({ data: 'viewer' }); // Default to viewer role
    }
    return Promise.resolve({ data: null });
  })
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));
