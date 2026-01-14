# Stripe Integration Guide

This guide explains how the Stripe integration works in this Next.js application.

## Setup Instructions

### 1. Environment Variables

The following environment variables are required in your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

### 2. Testing Locally

#### Start your Next.js development server:
```bash
pnpm dev
```

#### Set up Stripe webhooks for local testing:

Install the Stripe CLI:
```bash
# On macOS
brew install stripe/stripe-cli/stripe

# On Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

Login to Stripe CLI:
```bash
stripe login
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

This will output a webhook signing secret (starts with `whsec_`). Copy this value and update your `.env.local` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. Test the Integration

1. Navigate to `/checkout` in your browser
2. Enter an amount (e.g., $10.00)
3. Click "Checkout"
4. Use Stripe's test card number: `4242 4242 4242 4242`
5. Use any future expiry date (e.g., 12/34)
6. Use any 3-digit CVC (e.g., 123)
7. Complete the checkout
8. You'll be redirected to `/result` with the payment status

## File Structure

```
app/
├── api/
│   ├── checkout_sessions/
│   │   ├── route.ts              # Create checkout session
│   │   └── [id]/
│   │       └── route.ts          # Retrieve checkout session
│   └── webhooks/
│       └── route.ts              # Handle Stripe webhooks
└── (main)/
    ├── checkout/
    │   └── page.tsx              # Checkout demo page
    └── result/
        └── page.tsx              # Payment result page

src/
├── components/
│   └── CheckoutForm.tsx          # Checkout form component
└── lib/
    ├── get-stripe.ts             # Stripe.js singleton
    └── api-helpers.ts            # API utility functions
```

## Key Components

### CheckoutForm Component
Located at `src/components/CheckoutForm.tsx`, this component:
- Accepts custom donation amounts
- Validates input
- Creates a checkout session via API
- Redirects to Stripe Checkout

### Checkout Sessions API
Located at `app/api/checkout_sessions/route.ts`, this endpoint:
- Creates Stripe checkout sessions
- Handles payment configuration
- Returns session ID for redirect

### Webhooks Handler
Located at `app/api/webhooks/route.ts`, this endpoint:
- Receives webhook events from Stripe
- Verifies webhook signatures
- Processes payment events (completed, failed, etc.)

## Webhook Events

The webhook handler listens for these events:

- `checkout.session.completed` - Checkout completed successfully
- `checkout.session.async_payment_succeeded` - Async payment succeeded
- `checkout.session.async_payment_failed` - Async payment failed
- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.payment_failed` - Payment failed

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

### Set up Production Webhooks

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks`
4. Select events to listen to (at minimum: `checkout.session.completed`)
5. Copy the signing secret and add it to your Vercel environment variables

## Testing Cards

Stripe provides test card numbers for different scenarios:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **3D Secure required**: `4000 0025 0000 3155`

See more test cards in the [Stripe Testing Documentation](https://stripe.com/docs/testing).

## Security Notes

- Never commit `.env.local` file (already in `.gitignore`)
- Keep your `STRIPE_SECRET_KEY` secure
- Always verify webhook signatures
- Use HTTPS in production
- The `NEXT_PUBLIC_` prefix exposes variables to the browser - only use it for publishable keys

## Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
