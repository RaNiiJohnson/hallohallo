import CheckoutForm from '@/components/CheckoutForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutPage() {
  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout with Stripe</CardTitle>
          <CardDescription>
            Enter an amount to test the Stripe Checkout integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutForm />
        </CardContent>
      </Card>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Enter an amount between $1 and $5000</li>
          <li>• Click "Checkout" to be redirected to Stripe Checkout</li>
          <li>• Use test card: <code className="bg-background px-2 py-1 rounded">4242 4242 4242 4242</code></li>
          <li>• Use any future expiry date and any 3-digit CVC</li>
          <li>• After payment, you'll be redirected to the result page</li>
        </ul>
      </div>
    </div>
  );
}
