
'use client'

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useTenant } from "@/hooks/useTenant"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

export function AlertsDashboard() {
  const { tenant } = useTenant()

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', tenant?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('agent_alerts')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('triggered_at', { ascending: false })
      return data || []
    },
    enabled: !!tenant?.id
  })

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'failure':
        return 'bg-destructive'
      case 'success':
        return 'bg-green-500'
      case 'escalation':
        return 'bg-yellow-500'
      default:
        return 'bg-secondary'
    }
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{alert.agent}</Badge>
                    <Badge className={getAlertColor(alert.alert_type)}>
                      {alert.alert_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(alert.triggered_at), 'PPp')}
                </time>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          No alerts yet
        </p>
      )}
    </ScrollArea>
  )
}
