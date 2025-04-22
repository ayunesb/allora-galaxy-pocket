
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { useState } from "react";

export function SandboxButton({
  schema_sql,
  disabled,
}: {
  schema_sql: string;
  disabled: boolean;
}) {
  const { tenant } = useTenant();
  const [isTesting, setIsTesting] = useState(false);

  const trySandbox = async () => {
    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }
    if (!schema_sql) {
      toast.error("No SQL schema provided to test");
      return;
    }
    setIsTesting(true);
    try {
      const response = await supabase.functions.invoke('sandbox-install', {
        body: JSON.stringify({
          tenant_id: tenant.id,
          schema_sql,
        }),
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      const data = response.data;
      if (data.success) {
        toast.success("Schema tested successfully in sandbox", {
          description: "Your database schema looks good and can be installed safely.",
        });
      } else {
        toast.error("Schema test failed", {
          description: data.message || "There was an error testing your schema.",
        });
      }
    } catch (error) {
      toast.error("Failed to test in sandbox", {
        description: (error as Error).message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button
      onClick={trySandbox}
      variant="outline"
      size="sm"
      disabled={isTesting || disabled}
    >
      {isTesting ? "Testing..." : "Test in Sandbox"}
    </Button>
  );
}
