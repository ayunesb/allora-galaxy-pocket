import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUpdateAgentProfile } from "../hooks/useUpdateAgentProfile";
import { type AgentProfile } from "../hooks/useAgentProfile";
import AgentPromptEditor from "./AgentPromptEditor";

const agentFormSchema = z.object({
  agent_name: z.string().min(2).max(50),
  role: z.string().min(2),
  tone: z.string(),
  language: z.string(),
  channels: z.array(z.string()),
  enabled_tools: z.array(z.string()),
  avatar_url: z.string().url().optional(),
  model_provider: z.enum(['openai', 'gemini', 'anthropic']).optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const tones = ["Friendly", "Professional", "Assertive", "Playful"];
const languages = ["English", "Spanish", "French", "German"];
const channels = ["Email", "WhatsApp", "TikTok", "Meta"];
const tools = ["Strategy", "Campaign", "Assistant", "Reports"];
const modelProviders = ["openai", "gemini", "anthropic"];

export default function AgentProfileEditor({ initialData }: { initialData?: AgentProfile }) {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { mutate: updateAgent, isPending } = useUpdateAgentProfile();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: initialData || {
      agent_name: "",
      role: "",
      tone: "Professional",
      language: "English",
      channels: [],
      enabled_tools: ["Strategy", "Assistant"],
      avatar_url: "",
      model_provider: "openai",
    },
  });

  const [mainPrompt, setMainPrompt] = useState(initialData?.prompt || "");

  async function onSubmit(data: AgentFormValues) {
    if (!tenant) return;
    
    try {
      await updateAgent({
        ...data,
        tenant_id: tenant.id,
      });
      
      toast({
        title: "Agent profile updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent profile.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="agent_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Clara, Nova" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sales Coach, Marketing Assistant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Optional avatar image URL" 
                  {...field} 
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model_provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Provider</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {modelProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
      <div className="mt-10">
        <AgentPromptEditor
          agentName={initialData?.agent_name || ""}
          initialPrompt={mainPrompt}
          onUpdate={setMainPrompt}
        />
      </div>
    </Form>
  );
}
