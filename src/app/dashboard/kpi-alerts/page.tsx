
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { KpiAlertRules } from "./KpiAlertRules"

export default function KpiAlertsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>📊 KPI Alert Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <KpiAlertRules />
        </CardContent>
      </Card>
    </div>
  )
}
