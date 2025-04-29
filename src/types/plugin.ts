
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  category?: string;
  key?: string;
  tags?: string[];
  icon_url?: string;
  install_url?: string;
  slug?: string;
  badge?: string;
}

export interface PluginInstall {
  id: string;
  plugin_id: string;
  tenant_id: string;
  installed_at: string;
  enabled: boolean;
  last_checked_version?: string;
}

export interface PluginConfig {
  id: string;
  tenant_id: string;
  plugin_key: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type PluginStatus = 'active' | 'disabled' | 'error' | 'updating';
