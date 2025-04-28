
// Add a file for plugin list

export interface PluginDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export const pluginList: PluginDefinition[] = [
  {
    key: 'analytics',
    name: 'Analytics',
    description: 'Track user behavior and conversion metrics',
    icon: '📊',
  },
  {
    key: 'email',
    name: 'Email Marketing',
    description: 'Send automated emails and campaigns',
    icon: '📧',
  },
  {
    key: 'social',
    name: 'Social Media',
    description: 'Create and schedule social media posts',
    icon: '🌐',
  },
  {
    key: 'seo',
    name: 'SEO Tools',
    description: 'Optimize your content for search engines',
    icon: '🔍',
  },
  {
    key: 'crm',
    name: 'CRM Integration',
    description: 'Connect with your customer relationship management',
    icon: '👥',
  }
];
