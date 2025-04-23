
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useTenant } from '@/hooks/useTenant'
import { toast } from 'sonner'

export function useTokenStorage() {
  const { tenant } = useTenant()
  const [isStoring, setIsStoring] = useState(false)

  const storeToken = async (service: string, token: string) => {
    if (!tenant?.id) {
      toast.error('No tenant selected')
      return false
    }

    setIsStoring(true)
    try {
      const { error } = await supabase.functions.invoke('token-manager', {
        body: { token, service, tenant_id: tenant.id }
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
