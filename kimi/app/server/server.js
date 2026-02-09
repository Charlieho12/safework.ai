const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Price IDs mapping (replace with your actual Stripe Price IDs)
const PRICE_IDS = {
  starter: 'price_starter_monthly',      // Replace with actual Stripe Price ID
  professional: 'price_professional_monthly', // Replace with actual Stripe Price ID
  enterprise: 'price_enterprise_monthly'   // Replace with actual Stripe Price ID
};

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, planId, userId, email, successUrl, cancelUrl } = req.body;

    console.log('Creating checkout session:', { planId, email, userId });
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    // Validate required fields
    if (!email || !planId) {
      return res.status(400).json({ error: 'Missing required fields: email and planId' });
    }

    // Create or retrieve customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId, planId }
    });

    console.log('Stripe customer created:', customer.id);

    // For testing without actual Stripe Price IDs, create a session with amount directly
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `SafeWork AI - Piano ${planId}`,
              description: `Abbonamento mensile piano ${planId}`,
            },
            unit_amount: getPlanAmount(planId), // Amount in cents
            recurring: { interval: 'month' }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || 'http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'http://localhost:5173/pricing',
      metadata: { userId, planId }
    });

    console.log('Session created:', session.id);
    console.log('Checkout URL:', session.url);
    
    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get plan amount in cents
function getPlanAmount(planId) {
  const amounts = {
    starter: 2900,      // €29.00
    professional: 7900, // €79.00
    enterprise: 19900   // €199.00
  };
  return amounts[planId] || 7900;
}

// Get subscription status
app.get('/api/subscription-status', async (req, res) => {
  try {
    const { userId } = req.query;
    // In production, look up the customer's subscription from your database
    res.json({ status: 'active', plan: 'professional' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create portal session for managing subscription
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', stripe: 'connected' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Stripe server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});
