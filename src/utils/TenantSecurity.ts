
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Wrapper for tenant access functions that handles the infinite recursion issue
 * by using security definer functions designed to avoid RLS policy loops
 */
export const validateTenantAccess = async (tenantId: string, userId: string): Promise<boolean> => {
  try {
    // Use security definer function to safely check tenant access
    const { data, error } = await supabase.rpc(
      'check_tenant_user_access_safe', 
      { tenant_uuid: tenantId, user_uuid: userId }
    );
    
    if (error) {
      console.error('Error validating tenant access:', error);
      return false;
    }
    
    return Boolean(data);
  } catch (error: any) {
    console.error('Failed to validate tenant access:', error);
    return false;
  }
};

/**
 * Safely retrieves a user's tenant IDs using a security definer function
 * that avoids the infinite recursion issue in RLS policies
 */
export const getUserTenants = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_tenant_ids_safe');
    
    if (error) {
      console.error('Error getting tenant IDs:', error);
      toast.error('Failed to load tenant information');
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error retrieving tenant IDs:', error);
    return [];
  }
};

/**
 * Gets user role for a specific tenant using a security definer function
 */
export const getUserRoleForTenant = async (tenantId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc(
      'get_user_role_for_tenant_safe',
      { tenant_uuid: tenantId }
    );
    
    if (error) {
      console.error('Error getting user role:', error);
      return 'viewer'; // Default fallback role
    }
    
    return data || 'viewer';
  } catch (error: any) {
    console.error('Error retrieving user role:', error);
    return 'viewer';
  }
};

/**
 * Generates a secure random ID for sensitive operations
 * using Web Crypto API instead of nanoid
 */
export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

/**
 * Creates a secure tenant-specific token for sensitive operations
 */
export const generateSecureTenantToken = (tenantId: string, purpose: string): string => {
  // Combine randomness with tenant info
  const randomPart = crypto.randomUUID();
  const timestamp = Date.now().toString(36);
  
  // Create a token with pattern that's secure but also contains tenant info
  return `${purpose}_${timestamp}_${tenantId.substr(0, 8)}_${randomPart}`;
};

/**
 * Validates a security token against expected patterns
 */
export const validateSecurityToken = (token: string, expectedPattern: RegExp): boolean => {
  return expectedPattern.test(token);
};
