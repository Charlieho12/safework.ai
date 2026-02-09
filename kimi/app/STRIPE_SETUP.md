# Stripe Payment Integration Setup

This document describes how to set up the Stripe payment integration for SafeWork AI.

## Prerequisites

1. A Stripe account: [Sign up here](https://dashboard.stripe.com/register)
2. Node.js backend server (Express.js recommended)

## Configuration

### 1. Environment Variables

Your Stripe test keys are already configured in `.env`:

```env
VITE_STRIPE_PUBLIC_KEY=mk_1RMVuL07tlvSSDJL4psyjM0N
STRIPE_SECRET_KEY=mk_1RMVuH07tlvSSDJLD2PwDvp0
```

For production, replace these with your live keys from the Stripe Dashboard.

### 2. Get Your Stripe Keys (if needed)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** for `VITE_STRIPE_PUBLIC_KEY`
3. Copy your **Secret key** for `STRIPE_SECRET_KEY`

### 2. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_`) for `VITE_STRIPE_PUBLIC_KEY`
3. Copy your **Secret key** (starts with `sk_`) for `STRIPE_SECRET_KEY`

### 3. Create Products and Prices in Stripe

Create three subscription products in your Stripe Dashboard:

1. **Starter** - €29/month
2. **Professional** - €79/month  
3. **Enterprise** - €199/month

For each product:
1. Go to [Products](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Set the name and price
4. Set billing period to "Monthly"
5. Copy the Price ID (starts with `price_`)

Update the `STRIPE_PRICE_IDS` in `src/lib/stripe.ts`:

```typescript
export const STRIPE_PRICE_IDS = {
  starter: 'price_your_starter_price_id',
  professional: 'price_your_professional_price_id',
  enterprise: 'price_your_enterprise_price_id'
};
```

### 4. Backend Setup

The backend API example is in `server/stripe-api.js`. 

Install required dependencies:

```bash
npm install stripe express
```

Set up your Express server:

```javascript
const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./server/stripe-api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Stripe API routes
app.use('/api', stripeRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5. Webhook Setup (Important for Production)

Webhooks allow Stripe to notify your server when events occur (payments, cancellations, etc.).

#### Local Development

Use the Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/webhook
```

Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env` file.

#### Production

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/api/webhook`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copy the signing secret and add to environment variables

## Frontend Usage

### Current Implementation

The frontend includes:
- `CheckoutPage.tsx` - Payment form with Stripe Checkout redirect
- `CheckoutSuccessPage.tsx` - Success page after payment
- `PricingPage.tsx` - Plan selection

### Payment Flow

1. User selects a plan on `/pricing`
2. User clicks "Inizia Prova Gratuita" and goes to `/checkout?plan=professional`
3. In the checkout page:
   - Toggle "Modalità Demo" to switch between mock and real Stripe payment
   - Click "Paga Ora" to proceed
4. In demo mode: Payment is simulated locally
5. In Stripe mode: User is redirected to Stripe Checkout
6. After successful payment, user is redirected to `/checkout/success`

### Enabling Real Stripe Payments

1. Set up your backend API
2. Update `.env` with real Stripe keys
3. In `src/lib/stripe.ts`, set `useMockPayment` to `false`:

```typescript
const [useMockPayment, setUseMockPayment] = useState(false);
```

Or better, check for environment:

```typescript
const useMockPayment = import.meta.env.VITE_USE_MOCK_PAYMENT === 'true';
```

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Require 3D Secure**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Test Webhooks Locally

```bash
# Trigger a test event
stripe trigger checkout.session.completed
```

## Security Considerations

1. **Never expose your Secret Key** in the frontend
2. **Always verify webhooks** using the signing secret
3. **Store customer/subscription IDs** in your database
4. **Use HTTPS** in production
5. **Implement idempotency** for payment operations

## Troubleshooting

### Payment not processing
- Check browser console for errors
- Verify Stripe public key is correct
- Check backend logs

### Webhooks not working
- Verify webhook signing secret is correct
- Check if webhook endpoint is accessible
- Look at Stripe Dashboard webhook logs

### CORS errors
- Ensure backend allows requests from your frontend domain
- Check `VITE_API_URL` is set correctly

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe JS Reference](https://stripe.com/docs/js)
- [Stripe React Elements](https://stripe.com/docs/stripe-js/react)
