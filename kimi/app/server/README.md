# SafeWork AI Stripe Backend

This is the backend server for Stripe payment integration.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_...
PORT=3001
```

3. Start the server:
```bash
npm start
```

Or with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `POST /api/create-checkout-session` - Create a Stripe Checkout session
- `GET /api/subscription-status` - Get user's subscription status
- `POST /api/create-portal-session` - Create customer portal session
- `GET /api/health` - Health check

## Test Cards

Use these test card numbers in Stripe test mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.
