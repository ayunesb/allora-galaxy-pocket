
'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useTenant } from "@/hooks/useTenant"

export function KpiAlertRules() {
  const { tenant } = useTenant()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [newRule, setNewRule] = useState({
    kpi_name: "",
    condition: "<",
    threshold: 0,
    compare_period: "7d"
  })

  const { data: rules = [] } = useQuery({
    queryKey: ['kpi-alert-rules', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return []
      const { data } = await supabase
        .from('kpi_alert_rules')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
      return data || []
    },
    enabled: !!tenant?.id
  })

  const createRule = useMutation({
    mutationFn: async (rule: typeof newRule) => {
      if (!tenant?.id) throw new Error('No tenant selected')
      const { error } = await supabase
        .from('kpi_alert_rules')
        .insert([{ ...rule, tenant_id: tenant.id }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-alert-rules'] })
      toast({ title: "Alert rule created" })
      setNewRule({
        kpi_name: "",
        condition: "<",
        threshold: 0,
        compare_period: "7d"
      })
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create rule",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const toggleRule = useMutation({
    mutationFn: async ({ id, enabled }: { id: string, enabled: boolean }) => {
      const { error } = await supabase
        .from('kpi_alert_rules')
        .update({ enabled })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-alert-rules'] })
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 max-w-xl">
        <Input
          placeholder="KPI Name (e.g. Revenue, Users)"
          value={newRule.kpi_name}
          onChange={(e) => setNewRule(prev => ({ ...prev, kpi_name: e.target.value }))}
        />
        <Select
          value={newRule.condition}
          onValueChange={(value) => setNewRule(prev => ({ ...prev, condition: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="<">Less than</SelectItem>
            <SelectItem value=">">Greater than</SelectItem>
            <SelectItem value="falls_by_%">Falls by %</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Threshold value"
          value={newRule.threshold}
          onChange={(e) => setNewRule(prev => ({ ...prev, threshold: Number(e.target.value) }))}
        />
        <Input
          placeholder="Compare period (e.g. 7d, 30d)"
          value={newRule.compare_period}
          onChange={(e) => setNewRule(prev => ({ ...prev, compare_period: e.target.value }))}
        />
        <Button 
          onClick={() => createRule.mutate(newRule)}
          disabled={createRule.isPending}
        >
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <p className="font-medium">{rule.kpi_name}</p>
              <p className="text-sm text-muted-foreground">
                {rule.condition} {rule.threshold} ({rule.compare_period})
              </p>
            </div>
            <Switch
              checked={rule.enabled}
              onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, enabled: checked })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
