import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong in the checkout session id" },
      { status: 500 },
    );
  }
}
