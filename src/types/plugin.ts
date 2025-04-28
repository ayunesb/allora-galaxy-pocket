
export interface Plugin {
  id: string;
  name: string;
  key: string;
  description?: string;
  version?: string;
  author?: string;
  badge?: string;
  category?: string;
  icon_url?: string;
  install_url?: string;
  slug?: string;
  changelog?: any;
  created_at?: string;
}

// Add this type alias to fix the PluginKey reference issue
export type PluginKey = Plugin['key'];
