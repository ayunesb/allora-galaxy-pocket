
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertsDashboard } from "./AlertsDashboard"

export default function AlertsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>🔔 AI Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertsDashboard />
        </CardContent>
      </Card>
    </div>
  )
}
