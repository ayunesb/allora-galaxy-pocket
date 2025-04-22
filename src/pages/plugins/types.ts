
export interface Plugin {
  id: string;
  name: string;
  description: string;
  badge?: string;
  version: string;
  author: string;
  icon_url?: string;
  changelog?: any[];
  category?: string;
}
