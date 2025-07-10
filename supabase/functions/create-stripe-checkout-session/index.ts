// @ts-ignore - Deno runtime types
import Stripe from 'npm:stripe@12.6.0';

// @ts-ignore - Deno runtime
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: 'Missing Stripe secret key' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });

  try {
    const { amount, entryId, entryNumber } = await req.json();
    if (!amount || !entryId || !entryNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Stripe expects amount in cents (integer)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Grading Entry #${entryNumber}`,
              metadata: { entryId },
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://pikamon.eu/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://pikamon.eu/payment-cancelled',
      metadata: { entryId, entryNumber },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}); 