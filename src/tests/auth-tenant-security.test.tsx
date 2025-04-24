
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { AuthProvider } from '@/hooks/useAuth';
import { TenantProvider } from '@/hooks/useTenant';
import { MemoryRouter } from 'react-router-dom';
import RequireAuth from '@/guards/RequireAuth';
import RoleGuard from '@/guards/RoleGuard';

// Test component that uses auth hooks
const TestAuthComponent = () => {
  const { user, session } = useAuth();
  return (
    <div>
      {user ? `Authenticated as ${user.id}` : 'Not authenticated'}
    </div>
  );
};

// Test component that uses tenant hooks
const TestTenantComponent = () => {
  const { tenant } = useTenant();
  return (
    <div>
      {tenant ? `In tenant ${tenant.id}` : 'No tenant selected'}
    </div>
  );
};

// Test component for role access
const TestRoleComponent = () => {
  const { checkAccess } = useRoleAccess();
  return (
    <div>
      <div data-testid="role-check">
        {checkAccess('admin').then(hasAccess => 
          hasAccess ? 'Has admin access' : 'No admin access'
        )}
      </div>
    </div>
  );
};

describe('Authentication & Tenant Security', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <AuthProvider>
        <TenantProvider>
          {children}
        </TenantProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Authentication Flow', () => {
    it('should start unauthenticated', () => {
      render(<TestAuthComponent />, { wrapper });
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });

    it('should require auth for protected routes', () => {
      render(
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>,
        { wrapper }
      );
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Tenant Isolation', () => {
    it('should start with no tenant', () => {
      render(<TestTenantComponent />, { wrapper });
      expect(screen.getByText('No tenant selected')).toBeInTheDocument();
    });

    it('should restrict access without tenant', () => {
      render(
        <RequireAuth>
          <TestTenantComponent />
        </RequireAuth>,
        { wrapper }
      );

      expect(screen.queryByText(/In tenant/)).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access', () => {
    it('should restrict admin-only content', () => {
      render(
        <RoleGuard allowedRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>,
        { wrapper }
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should check role access', async () => {
      render(<TestRoleComponent />, { wrapper });
      
      await waitFor(() => {
        expect(screen.getByTestId('role-check')).toHaveTextContent('No admin access');
      });
    });
  });
});
