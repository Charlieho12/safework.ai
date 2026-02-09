// Stripe Backend API Example
// This file demonstrates how to set up the backend API endpoints for Stripe

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, planId, userId, email, successUrl, cancelUrl } = req.body;

    // Create or retrieve customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
        planId
      }
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // This should be the Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId
      },
      subscription_data: {
        metadata: {
          userId,
          planId
        }
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create customer portal session
router.post('/create-portal-session', async (req, res) => {
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

// Get subscription status
router.get('/subscription-status', async (req, res) => {
  try {
    const { userId } = req.query;

    // Find customer by userId (you should store this mapping in your database)
    const customers = await stripe.customers.list({
      limit: 1,
      // You'd typically query your database here to get the Stripe customer ID
    });

    if (customers.data.length === 0) {
      return res.json({ status: 'inactive' });
    }

    const customer = customers.data[0];

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({ status: 'inactive' });
    }

    const subscription = subscriptions.data[0];

    res.json({
      status: subscription.status,
      plan: subscription.items.data[0].price.nickname || 'unknown',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify checkout session (after redirect from Stripe)
router.get('/verify-checkout-session', async (req, res) => {
  try {
    const { sessionId } = req.query;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update user's subscription status in your database
      // await db.users.update({ ... });

      res.json({
        success: true,
        plan: session.metadata.planId,
        customerId: session.customer,
        subscriptionId: session.subscription,
      });
    } else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Fulfill the purchase
      console.log('Payment succeeded:', session);
      // Update user subscription in database
      // await db.users.update({ stripeSubscriptionId: session.subscription, ... });
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Continue to provision the subscription as payments continue to be made
      console.log('Invoice payment succeeded:', invoice);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // The payment failed or the customer does not have a valid payment method
      console.log('Invoice payment failed:', failedInvoice);
      // Notify user and update subscription status
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Subscription was cancelled
      console.log('Subscription cancelled:', subscription);
      // Update user subscription status in database
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
