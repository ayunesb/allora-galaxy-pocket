
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export type PluginSubmitFormState = {
  plugin_name: string;
  description: string;
  zip_url: string;
  schema_sql: string;
  install_script: string;
  license_type: "free" | "proprietary" | "nft";
  price_usd: string;
};

const initialFormState: PluginSubmitFormState = {
  plugin_name: "",
  description: "",
  zip_url: "",
  schema_sql: "",
  install_script: "",
  license_type: "free",
  price_usd: "",
};

export function usePluginSubmitForm() {
  const { tenant } = useTenant();
  const [form, setForm] = useState<PluginSubmitFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof PluginSubmitFormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const resetForm = () => setForm(initialFormState);

  const handleSubmit = async () => {
    if (!form.plugin_name || !form.description) {
      toast.error("Please fill in the required fields");
      return;
    }
    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("plugin_submissions").insert({
        ...form,
        tenant_id: tenant.id,
      });
      if (error) throw error;
      toast.success("Plugin submitted for review 🚀", {
        description: "Our team will review your plugin submission soon.",
      });
      resetForm();
    } catch (error) {
      toast.error("Failed to submit plugin", {
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    setForm,
    handleChange,
    handleSubmit,
    isSubmitting,
  };
}
