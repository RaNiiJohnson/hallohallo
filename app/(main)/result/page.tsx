'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchGetJSON } from '@/lib/api-helpers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [session, setSession] = useState<any>(null);
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
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>No checkout session found</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (session?.payment_status === 'paid') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Payment ID:</p>
            <p className="font-mono text-sm">{sessionId}</p>
          </div>
          {session.amount_total && (
            <div>
              <p className="text-sm text-muted-foreground">Amount:</p>
              <p className="text-2xl font-bold">
                ${(session.amount_total / 100).toFixed(2)}
              </p>
            </div>
          )}
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-amber-600">Payment Pending</CardTitle>
        <CardDescription>Your payment is being processed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ResultPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}
