
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Strategy } from "@/types/strategy";

interface StrategySectionProps {
  strategies?: Strategy[];
}

export function StrategySection({ strategies }: StrategySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="approved">
          <TabsList className="mb-4">
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="approved">
            {strategies?.filter(s => s.status === 'approved').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No approved strategies yet
              </div>
            ) : (
              <div className="space-y-4">
                {strategies?.filter(s => s.status === 'approved').map(strategy => (
                  <div key={strategy.id} className="border rounded-md p-3">
                    <h3 className="font-medium">{strategy.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {strategy.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {strategies?.filter(s => s.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending strategies
              </div>
            ) : (
              <div className="space-y-4">
                {strategies?.filter(s => s.status === 'pending').map(strategy => (
                  <div key={strategy.id} className="border rounded-md p-3">
                    <h3 className="font-medium">{strategy.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {strategy.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
