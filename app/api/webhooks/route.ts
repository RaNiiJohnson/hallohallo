import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Successfully constructed event
  console.log('✅ Success:', event.id);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`💰 PaymentIntent succeeded: ${paymentIntent.id}`);
      // Handle successful payment here
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      console.log(`❌ Payment failed: ${paymentIntentFailed.id}`);
      // Handle failed payment here
      break;
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`🛒 Checkout session completed: ${session.id}`);
      // Handle successful checkout here
      // You can fulfill the order, send confirmation email, etc.
      break;
    case 'checkout.session.async_payment_succeeded':
      const sessionAsync = event.data.object as Stripe.Checkout.Session;
      console.log(`💳 Async payment succeeded: ${sessionAsync.id}`);
      // Handle async payment success here
      break;
    case 'checkout.session.async_payment_failed':
      const sessionAsyncFailed = event.data.object as Stripe.Checkout.Session;
      console.log(`❌ Async payment failed: ${sessionAsyncFailed.id}`);
      // Handle async payment failure here
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
