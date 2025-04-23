
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useBillingProfile } from "@/hooks/useBillingProfile";

export function CreditsPlanCard() {
  const [creditAmount, setCreditAmount] = useState<number>(100);
  const { profile, isLoading: profileLoading, addCredits, updatePlan } = useBillingProfile();

  const handleAddCredits = () => {
    if (!creditAmount || creditAmount <= 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }
    addCredits.mutate(creditAmount);
  };

  const handlePlanChange = (plan: 'standard' | 'growth' | 'pro') => {
    updatePlan.mutate(plan);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span>💳</span>
          <span>Billing & Usage</span>
        </CardTitle>
        <CardDescription>
          Manage your subscription and view usage statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Current Plan:</span>
          <span className="font-medium">
            {profileLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Loading...
              </span>
            ) : (
              profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "Standard"
            )}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button 
            variant={profile?.plan === 'standard' ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePlanChange('standard')}
            disabled={addCredits.isPending || updatePlan.isPending}
          >
            Standard
          </Button>
          <Button 
            variant={profile?.plan === 'growth' ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePlanChange('growth')}
            disabled={addCredits.isPending || updatePlan.isPending}
          >
            Growth
          </Button>
          <Button 
            variant={profile?.plan === 'pro' ? "default" : "outline"} 
            size="sm"
            onClick={() => handlePlanChange('pro')}
            disabled={addCredits.isPending || updatePlan.isPending}
          >
            Pro
          </Button>
        </div>

        <div className="pt-4">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Sparkles className="h-4 w-4 mr-2" /> Upgrade Plan
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Input
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(Number(e.target.value))}
            placeholder="Credit amount"
            min="1"
            disabled={addCredits.isPending}
          />
          <Button 
            onClick={handleAddCredits}
            disabled={addCredits.isPending}
          >
            {addCredits.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Credits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
