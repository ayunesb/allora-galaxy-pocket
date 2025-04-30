import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

export default function BillingPage() {
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({
      lineItems: [{ price: import.meta.env.VITE_STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      successUrl: window.location.origin + '/dashboard',
      cancelUrl: window.location.origin + '/billing',
    });
  };

  const handleCustomerPortal = async () => {
    const res = await fetch('/api/stripe/customer-portal', {
      method: 'POST',
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Manage Your Subscription</h1>
      <button onClick={handleCheckout} className="bg-black text-white px-4 py-2 rounded mr-4">
        Subscribe
      </button>
      <button onClick={handleCustomerPortal} className="bg-gray-800 text-white px-4 py-2 rounded">
        Customer Portal
      </button>
    </div>
  );
}