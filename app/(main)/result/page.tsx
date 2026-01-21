"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchGetJSON } from "@/lib/api-helpers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stripe } from "stripe";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Receipt,
} from "lucide-react";
import { motion } from "motion/react";

function ResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [session, setSession] = useState<Stripe.Checkout.Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchGetJSON(`/api/checkout_sessions/${sessionId}`)
        .then((data) => {
          setSession(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="text-muted-foreground">Loading payment details...</p>
        </motion.div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <div>
                <CardTitle>No Checkout Session Found</CardTitle>
                <CardDescription>
                  Unable to find payment information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              It seems you arrived here without a valid checkout session. Please
              start a new payment.
            </p>
            <Button asChild className="w-full">
              <Link href="/checkout">Start New Payment</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (session?.payment_status === "paid") {
    return <PaymentSucceeded session={session} sessionId={sessionId} />;
  }

  if (session?.payment_status === "unpaid") {
    return <UnpaidPayment session={session} sessionId={sessionId} />;
  }

  if (session?.payment_status === "no_payment_required") {
    return <NoPaymentRequired session={session} sessionId={sessionId} />;
  }

  return <PendingPayment />;
}

function PendingPayment() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="w-8 h-8 text-amber-600" />
            </motion.div>
            <div>
              <CardTitle className="text-amber-600">Payment Pending</CardTitle>
              <CardDescription>Your payment is being processed</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your payment is currently being verified. This usually takes a few
              moments. Please check back in a few minutes or check your email
              for confirmation.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UnpaidPayment({
  session,
  sessionId,
}: {
  session: Stripe.Checkout.Session;
  sessionId: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <XCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            <div>
              <CardTitle className="text-red-600">
                Payment Unsuccessful
              </CardTitle>
              <CardDescription>
                Your payment could not be processed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              What happened?
            </h4>
            <p className="text-sm text-red-800 dark:text-red-200 mb-2">
              Your payment was not completed. This could be due to:
            </p>
            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 list-disc list-inside">
              <li>Insufficient funds</li>
              <li>Card declined by your bank</li>
              <li>Incorrect card details</li>
              <li>Session expired</li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Session ID:</p>
            <p className="font-mono text-xs break-all">{sessionId}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/checkout">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PaymentSucceeded({
  session,
  sessionId,
}: {
  session: Stripe.Checkout.Session;
  sessionId: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <div className="relative">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute inset-0 bg-green-500 rounded-full"
                />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-green-600 text-2xl">
                Payment Successful!
              </CardTitle>
              <CardDescription>Thank you for your payment</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <Receipt className="w-5 h-5 text-green-700 dark:text-green-300 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Payment Confirmed
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your payment has been successfully processed. You will receive
                  a confirmation email shortly.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-muted rounded-lg space-y-3"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Transaction ID
              </p>
              <p className="font-mono text-sm break-all">{sessionId}</p>
            </div>
            {session.amount_total && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Amount Paid
                </p>
                <p className="text-3xl font-bold text-green-600">
                  ${(session.amount_total / 100).toFixed(2)}
                </p>
              </div>
            )}
            {session.customer_email && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Receipt sent to
                </p>
                <p className="text-sm">{session.customer_email}</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NoPaymentRequired({
  session,
  sessionId,
}: {
  session: Stripe.Checkout.Session;
  sessionId: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </motion.div>
            <div>
              <CardTitle className="text-blue-600">
                No Payment Required
              </CardTitle>
              <CardDescription>Session completed successfully</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This checkout session was completed successfully and did not
              require any payment. This could be for a free trial, promotional
              offer, or zero-amount transaction.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Session ID:</p>
            <p className="font-mono text-xs break-all">{sessionId}</p>
          </div>

          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResultPage() {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
              />
              <p className="text-muted-foreground">
                Loading payment details...
              </p>
            </motion.div>
          </div>
        }
      >
        <ResultContent />
      </Suspense>
    </div>
  );
}
