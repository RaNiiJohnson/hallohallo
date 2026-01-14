'use client';

import { FormEvent, useState } from "react";
import { fetchPostJSON } from "@/lib/api-helpers";
import getStripe from "@/lib/get-stripe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CURRENCY = 'usd';
const MIN_AMOUNT = 1.0;
const MAX_AMOUNT = 5000.0;
const STRIPE_FEE_PERCENTAGE = 0.029; // 2.9%
const STRIPE_FEE_FIXED = 0.30; // $0.30

export default function CheckoutForm() {
    const { replace } = useRouter()
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        customDonation: Math.round(MAX_AMOUNT / 10),
    });

    // Calculate total amount needed so that after Stripe takes their fee,
    // the net amount received is exactly what the user specified
    // Formula: Total = (DesiredAmount + FixedFee) / (1 - PercentageFee)
    const calculateTotalWithFees = (desiredAmount: number) => {
        return (desiredAmount + STRIPE_FEE_FIXED) / (1 - STRIPE_FEE_PERCENTAGE);
    };

    const totalAmount = calculateTotalWithFees(input.customDonation);
    const stripeFee = totalAmount - input.customDonation;

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setInput({
            ...input,
            [e.currentTarget.name]: parseFloat(e.currentTarget.value),
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate amount
        if (input.customDonation < MIN_AMOUNT || input.customDonation > MAX_AMOUNT) {
            alert(`Please enter an amount between $${MIN_AMOUNT} and $${MAX_AMOUNT}`);
            setLoading(false);
            return;
        }

        try {
            // Create a Checkout Session with total amount (including fees) in cents
            const checkoutSession: any = await fetchPostJSON(
                '/api/checkout_sessions',
                { amount: Math.round(totalAmount * 100) },
            );

            if (checkoutSession.statusCode === 500) {
                toast.error(checkoutSession.message);

                setLoading(false);
                return;
            }

            // Redirect to Checkout using Stripe
            const stripe = await getStripe();
            if (!stripe) {
                toast.error('Stripe failed to load');
                setLoading(false);
                return;
            }

            setLoading(false);

            window.location.href = checkoutSession.url

        } catch (error) {
            toast.error('Error', {
                description:
                    String(error)
            });
            console.error('Error', error)
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="customDonation">
                    Your Amount ({CURRENCY.toUpperCase()})
                </Label>
                <Input
                    id="customDonation"
                    name="customDonation"
                    type="number"
                    placeholder="Enter amount"
                    step="0.01"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    value={input.customDonation}
                    onChange={handleInputChange}
                    required
                />
            </div>

            {/* Stripe Fee Breakdown */}
            {input.customDonation > 0 && !isNaN(input.customDonation) && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount you receive:</span>
                        <span className="font-medium">${input.customDonation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Stripe processing fee:
                        </span>
                        <span className="font-medium">${stripeFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total customer pays:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        * Calculated so you receive exactly ${input.customDonation.toFixed(2)} after Stripe's 2.9% + $0.30 fee
                    </p>
                </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
            </Button>
        </form>
    );
}

