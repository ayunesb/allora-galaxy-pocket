
'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { useTenant } from "@/hooks/useTenant"
import { useKpiAlertSuggestions, AlertRuleSuggestion } from "@/hooks/useKpiAlertSuggestions"
import { useNotifications } from "@/hooks/useNotifications"
import { useWebhookAlert } from "@/hooks/useWebhookAlert" 

export function KpiAlertRules() {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()
  const { sendNotification } = useNotifications()
  const { sendAlert } = useWebhookAlert()
  const [newRule, setNewRule] = useState({
    kpi_name: "",
    condition: "<",
    threshold: 0,
    compare_period: "7d"
  })
  
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { 
    generateSuggestions, 
    isGenerating, 
    suggestions, 
    error: suggestionError 
  } = useKpiAlertSuggestions()

  const { data: rules = [], isLoading } = useQuery({
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
      toast("Alert rule created")
      setNewRule({
        kpi_name: "",
        condition: "<",
        threshold: 0,
        compare_period: "7d"
      })
      
      // Send notification about new KPI rule
      sendNotification({
        event_type: "kpi_rule_created",
        description: `New KPI alert rule created for ${newRule.kpi_name}`
      })
    },
    onError: (error) => {
      toast.error(`Failed to create rule: ${error.message}`)
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

  const handleSendTestAlert = async (rule: any) => {
    try {
      // Send a test alert through SMS
      const { error } = await supabase.functions.invoke("twilio-send-sms", {
        body: { 
          to: "+1234567890", // This would come from tenant settings
          message: `[TEST] KPI Alert for ${rule.kpi_name}: Value ${rule.condition} ${rule.threshold}`
        }
      })
      
      if (error) throw error
      
      toast.success("Test alert sent successfully")
      
      // Also send a webhook notification
      await sendAlert({
        message: `[TEST] KPI Alert for ${rule.kpi_name}: Value ${rule.condition} ${rule.threshold}`,
        channel: "slack"
      })
    } catch (err) {
      toast.error("Failed to send test alert")
    }
  }

  const handleGetSuggestions = () => {
    setShowSuggestions(true)
    generateSuggestions()
  }

  const applySuggestion = (suggestion: AlertRuleSuggestion) => {
    createRule.mutate(suggestion)
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 max-w-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Create KPI Alert Rule</h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleGetSuggestions}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Suggest Rules
          </Button>
        </div>
        
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
        <Select
          value={newRule.compare_period}
          onValueChange={(value) => setNewRule(prev => ({ ...prev, compare_period: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Compare period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="14d">14 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={() => createRule.mutate(newRule)}
          disabled={createRule.isPending}
        >
          Add Rule
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Alert className="bg-muted/50 border-muted">
          <AlertTitle>AI-Suggested Rules</AlertTitle>
          <AlertDescription>
            <div className="space-y-3 mt-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-card">
                  <div>
                    <p className="font-medium">{suggestion.kpi_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.condition} {suggestion.threshold} ({suggestion.compare_period})
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => applySuggestion(suggestion)}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Active Rules</h2>
        {rules.length === 0 ? (
          <p className="text-muted-foreground">No alert rules configured yet</p>
        ) : (
          rules.map((rule) => (
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
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSendTestAlert(rule)}
                >
                  Test
                </Button>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, enabled: checked })}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
