import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Stripe public key (publishable key)
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''; // Add your key to .env file

// Initialize Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

// Price IDs for plans (replace with actual Stripe Price IDs)
export const STRIPE_PRICE_IDS = {
  starter: 'price_1SyqzsErN8L58YaiJcjVC4Rc',
  professional: 'price_1Syr0VErN8L58YaicvLOdl5O',
  enterprise: 'price_enterprise_monthly'
} as const;

// Plan configuration with Stripe Price IDs
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: STRIPE_PRICE_IDS.starter,
    features: [
      'Fino a 10 lavori attivi',
      '100 foto/mese',
      'Analisi AI inclusa',
      'Report DOCX',
      'Supporto email'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 79,
    priceId: STRIPE_PRICE_IDS.professional,
    features: [
      'Lavori illimitati',
      'Foto illimitate',
      'Analisi AI prioritaria',
      'Report DOCX + PDF',
      'Supporto prioritario',
      'Team fino a 5 utenti'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceId: STRIPE_PRICE_IDS.enterprise,
    features: [
      'Tutto di Professional',
      'Team illimitato',
      'API access',
      'White label',
      'Account manager dedicato'
    ]
  }
} as const;

export type PlanId = keyof typeof PLANS;
export type { Stripe };

// API base URL - in production this would be your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create a checkout session
export const createCheckoutSession = async (planId: PlanId, userId: string, email: string) => {
  try {
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Creating checkout session for:', { planId, userId, email });
    
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: PLANS[planId].priceId,
        planId,
        userId,
        email,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Checkout session response:', data);
    
    if (!data.url) {
      throw new Error('No checkout URL received from server');
    }
    
    return data.url; // Returns the checkout URL to redirect to
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create a customer portal session
export const createPortalSession = async (customerId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/settings`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Get subscription status
export const getSubscriptionStatus = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subscription-status?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
};

// Mock implementation for demo (when no backend is available)
export const mockCreateCheckoutSession = async (planId: PlanId): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `mock_session_${planId}_${Date.now()}`;
};

export const mockGetSubscriptionStatus = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    status: 'active',
    plan: 'professional',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  };
};
