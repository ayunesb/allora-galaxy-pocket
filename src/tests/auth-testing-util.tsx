
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RequireAuth from '@/guards/RequireAuth';
import { AuthProvider } from '@/hooks/useAuth';
import { TenantProvider } from '@/hooks/useTenant';

// Mock component that displays auth state
const AuthStateDisplay = () => {
  const { user, session, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading auth...</div>;
  
  return (
    <div>
      <p data-testid="auth-status">
        {user ? 'Authenticated' : 'Not authenticated'}
      </p>
      <p data-testid="session-status">
        {session ? 'Active session' : 'No session'}
      </p>
      {user && (
        <p data-testid="user-email">{user.email}</p>
      )}
      {session && (
        <p data-testid="session-expiry">
          Expires: {new Date(session.expires_at! * 1000).toISOString()}
        </p>
      )}
    </div>
  );
};

// Protected route component
const ProtectedPage = () => <div>Protected Content</div>;

// Public route component
const PublicPage = () => <div>Public Content</div>;

// Auth page component
const AuthPage = () => <div>Login Page</div>;

// Create a test utility to render protected routes
export const renderWithAuth = (
  initialRoute: string = '/',
  { isAuthenticated = false } = {}
) => {
  // Create new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Mock auth state if needed
  // In real tests, you'd use jest.mock to mock the supabase auth
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <TenantProvider>
            <Routes>
              <Route path="/auth/*" element={<AuthPage />} />
              <Route path="/public" element={<PublicPage />} />
              <Route 
                path="/protected" 
                element={
                  <RequireAuth>
                    <ProtectedPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/auth-state" 
                element={<AuthStateDisplay />} 
              />
            </Routes>
          </TenantProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// Helper function to validate token expiration
export const validateTokenExpiration = (token: string): boolean => {
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Session persistence test helper
export const validateSessionPersistence = async () => {
  const { user, session } = useAuth();
  
  // Session validation criteria
  if (!user || !session) return false;
  
  // Validate the access token is not expired
  const tokenValid = validateTokenExpiration(session.access_token);
  
  // Check that expires_at is in the future
  const expiresAt = (session.expires_at || 0) * 1000;
  const now = Date.now();
  const expiryValid = expiresAt > now;
  
  // Log for debugging
  console.log('Session validation:', {
    hasUser: !!user,
    hasSession: !!session,
    tokenValid,
    expiryValid,
    expiresIn: Math.floor((expiresAt - now) / 1000 / 60), // minutes
  });
  
  return tokenValid && expiryValid;
};
