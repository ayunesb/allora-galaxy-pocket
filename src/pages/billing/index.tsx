
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Only load Stripe if we have a valid API key
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string) : 
  null;

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!stripePromise) {
      setError("Stripe API key is not configured");
      return;
    }
    
    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to initialize Stripe");
      }
      
      if (!import.meta.env.VITE_STRIPE_PRICE_ID) {
        throw new Error("Stripe price ID is not configured");
      }
      
      await stripe.redirectToCheckout({
        lineItems: [{ price: import.meta.env.VITE_STRIPE_PRICE_ID as string, quantity: 1 }],
        mode: 'subscription',
        successUrl: window.location.origin + '/dashboard',
        cancelUrl: window.location.origin + '/billing',
      });
    } catch (err) {
      console.error("Stripe checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerPortal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Customer portal error:", err);
      setError(err instanceof Error ? err.message : "Failed to open customer portal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Manage Your Subscription</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <button 
        onClick={handleCheckout} 
        className="bg-black text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
        disabled={isLoading || !stripePromise}
      >
        {isLoading ? 'Loading...' : 'Subscribe'}
      </button>
      
      <button 
        onClick={handleCustomerPortal} 
        className="bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Customer Portal'}
      </button>
      
      {!stripePromise && (
        <p className="mt-4 text-amber-600 text-sm">
          Note: Stripe integration is not configured. Please set VITE_STRIPE_PUBLIC_KEY and VITE_STRIPE_PRICE_ID environment variables.
        </p>
      )}
    </div>
  );
}
