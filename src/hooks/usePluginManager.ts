
import { usePluginInstallation } from "./usePluginInstallation";
import { usePluginConfig } from "./usePluginConfig";
import { Plugin } from "@/types/plugin";

export function usePluginManager() {
  const { 
    installPlugin, 
    uninstallPlugin, 
    isInstalling 
  } = usePluginInstallation();
  
  const {
    updatePluginConfig,
    getPluginConfig,
    isConfiguring
  } = usePluginConfig();

  // Provide default configurations for each plugin type
  const getDefaultConfig = (pluginKey: Plugin['key']): Record<string, any> => {
    switch (pluginKey) {
      case 'stripe':
        return {
          webhook_url: '',
          public_key: '',
          payment_methods: ['card'],
          currency: 'USD'
        };
      case 'hubspot':
        return {
          portal_id: '',
          webhook_url: '',
          sync_enabled: true
        };
      case 'shopify':
        return {
          shop_domain: '',
          api_version: '2023-07',
          sync_products: true,
          sync_orders: true
        };
      case 'ga4':
        return {
          property_id: '',
          measurement_id: '',
          auto_track: true
        };
      case 'twilio':
        return {
          phone_number: '',
          message_template: 'Hello {name}, thank you for your interest in our services.'
        };
      default:
        return {};
    }
  };

  return {
    installPlugin,
    uninstallPlugin,
    updatePluginConfig,
    getPluginConfig,
    getDefaultConfig,
    isInstalling,
    isConfiguring
  };
}
