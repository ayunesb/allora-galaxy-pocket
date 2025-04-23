
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/hooks/useTenant";
import { useAutoApproval } from "@/hooks/useAutoApproval";

export function AutoApprovalSettings() {
  const { tenant } = useTenant();
  const { toggleAutoApproval } = useAutoApproval();

  return (
    <div className="flex flex-col space-y-2 border p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="auto-approve" className="text-sm font-medium">Auto-Approve Strategies</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Allow AI to automatically approve strategies that meet performance thresholds
          </p>
        </div>
        <Switch 
          id="auto-approve"
          checked={tenant?.enable_auto_approve ?? true}
          onCheckedChange={(checked) => {
            if (tenant?.id) {
              toggleAutoApproval(checked);
            }
          }}
        />
      </div>
    </div>
  );
}
