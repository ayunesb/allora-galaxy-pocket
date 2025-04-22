
import { supabase } from "@/integrations/supabase/client";
import Stripe from 'stripe';
import { logAgentCollaboration } from './agentCollaboration';
import { logAgentMemory } from './memoryLogger';

export class StripeAgent {
  private sessionId: string;
  private tenantId: string;
  private stripe: Stripe;

  constructor(tenantId: string) {
    this.sessionId = crypto.randomUUID();
    this.tenantId = tenantId;
    this.stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10'  // Updated to the latest API version
    });
  }

  async createCustomer(customer: { email: string; name?: string }) {
    try {
      const stripeCustomer = await this.stripe.customers.create({
        email: customer.email,
        name: customer.name
      });

      // Log agent collaboration
      await logAgentCollaboration({
        sessionId: this.sessionId,
        agent: 'Stripe',
        message: `Created customer: ${stripeCustomer.id}`,
        tenantId: this.tenantId
      });

      // Log in agent memory
      await logAgentMemory({
        tenantId: this.tenantId,
        agentName: 'Stripe',
        context: `Created Stripe customer for ${customer.email}`,
        type: 'history'
      });

      return stripeCustomer;
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw error;
    }
  }

  async chargeCustomer(charge: { 
    customerId: string; 
    amount: number; 
    currency?: string 
  }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        customer: charge.customerId,
        amount: charge.amount,
        currency: charge.currency || 'usd',
        automatic_payment_methods: { enabled: true }
      });

      // Log agent collaboration
      await logAgentCollaboration({
        sessionId: this.sessionId,
        agent: 'Stripe',
        message: `Initiated charge: ${paymentIntent.id}`,
        tenantId: this.tenantId
      });

      // Log in agent memory
      await logAgentMemory({
        tenantId: this.tenantId,
        agentName: 'Stripe',
        context: `Charged customer ${charge.customerId}: $${charge.amount}`,
        type: 'history'
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe charge error:', error);
      throw error;
    }
  }

  linkDashboard(customerId: string) {
    return `https://dashboard.stripe.com/customers/${customerId}`;
  }
}
