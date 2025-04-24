
export interface Plugin {
  key: 'stripe' | 'hubspot' | 'shopify' | 'ga4' | 'twilio';
  label: string;
  description: string;
  category?: string;
  tags?: string[];
  icon?: string;
  version?: string;
  enabled?: boolean;
}

export interface PluginInstallation {
  id: string;
  tenant_id: string;
  plugin_key: string;
  enabled: boolean;
  installed_at: string;
}

export interface PluginConfiguration {
  id: string;
  tenant_id: string;
  plugin_key: string;
  config: Record<string, any>;
}

export interface PluginMetric {
  pluginKey: string;
  usageCount: number;
}
