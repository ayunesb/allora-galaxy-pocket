
import { supabase } from "@/integrations/supabase/client";
import { logAgentCollaboration } from './agentCollaboration';
import { logAgentMemory } from './memoryLogger';

interface ProductParams {
  title: string;
  description: string;
  price: number;
}

export class ShopifyAgent {
  private sessionId: string;
  private tenantId: string;

  constructor(tenantId: string) {
    this.sessionId = crypto.randomUUID();
    this.tenantId = tenantId;
  }

  async createProduct({ title, description, price }: ProductParams) {
    try {
      // Log the attempt to create a product
      await logAgentCollaboration({
        sessionId: this.sessionId,
        agent: 'Shopify',
        message: `Attempting to create product: ${title}`,
        tenantId: this.tenantId
      });

      const response = await fetch("https://api.shopify.com/v2/products.json", {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product: {
            title,
            body_html: description,
            variants: [{ price }]
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Shopify API error: ${response.status} ${errorBody}`);
      }

      const data = await response.json();

      // Log successful product creation to agent memory
      await logAgentMemory({
        tenantId: this.tenantId,
        agentName: 'Shopify',
        context: `Successfully created product: ${title}`,
        type: 'history'
      });

      return data;
    } catch (error) {
      console.error('ShopifyAgent product creation error:', error);
      
      // Log the failure
      await logAgentCollaboration({
        sessionId: this.sessionId,
        agent: 'Shopify',
        message: `Failed to create product: ${error.message}`,
        tenantId: this.tenantId
      });

      throw error;
    }
  }

  async getProducts() {
    try {
      const response = await fetch("https://api.shopify.com/v2/products.json", {
        headers: {
          "X-Shopify-Access-Token": import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Shopify API error: ${response.status} ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ShopifyAgent get products error:', error);
      throw error;
    }
  }
}
