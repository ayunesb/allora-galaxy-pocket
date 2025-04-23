
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useTenant } from '@/hooks/useTenant'
import { toast } from 'sonner'
import { SUPPORTED_SERVICES } from '@/config/supportedServices'

type TokenStorageParams = {
  token: string;
  service: typeof SUPPORTED_SERVICES[keyof typeof SUPPORTED_SERVICES];
  refresh_token?: string;
  expires_in?: number;
}

export function useTokenStorage() {
  const { tenant } = useTenant()
  const [isStoring, setIsStoring] = useState(false)

  const storeToken = async ({ token, service, refresh_token, expires_in }: TokenStorageParams) => {
    if (!tenant?.id) {
      toast.error('No tenant selected')
      return false
    }

    setIsStoring(true)
    try {
      const { error } = await supabase.functions.invoke('token-manager', {
        body: { 
          token, 
          service, 
          tenant_id: tenant.id,
          refresh_token,
          expires_in
        }
      })

      if (error) throw error

      toast.success('Token stored successfully')
      return true
    } catch (error) {
      console.error('Error storing token:', error)
      toast.error('Failed to store token')
      return false
    } finally {
      setIsStoring(false)
    }
  }

  return {
    storeToken,
    isStoring
  }
}
