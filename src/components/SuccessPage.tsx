import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Package, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderDetails {
  order_id: string;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_date: string;
}

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch order details from our view
        const { data, error } = await supabase
          .from('stripe_user_orders')
          .select('*')
          .eq('checkout_session_id', sessionId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching order details:', error);
        } else if (data) {
          setOrderDetails(data);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 p-8 text-center">
          <div className="mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-white/80 mb-8">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>

          {loading ? (
            <div className="glass-effect rounded-lg p-6 mb-8">
              <div className="animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            </div>
          ) : orderDetails ? (
            <div className="glass-effect rounded-lg p-6 mb-8 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Order ID</span>
                <span className="text-white font-medium">#{orderDetails.order_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Amount</span>
                <span className="text-white font-medium">
                  {formatPrice(orderDetails.amount_total, orderDetails.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Payment Status</span>
                <span className="text-green-400 font-medium capitalize">
                  {orderDetails.payment_status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Date</span>
                <span className="text-white font-medium">
                  {formatDate(orderDetails.order_date)}
                </span>
              </div>
            </div>
          ) : sessionId ? (
            <div className="glass-effect rounded-lg p-6 mb-8">
              <p className="text-white/60 text-sm">
                Order details will be available shortly.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            <Link
              to="/products"
              className="glass-button px-6 py-3 rounded-xl text-base font-medium flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Continue Shopping
            </Link>
            
            <Link
              to="/dashboard"
              className="glass-button px-6 py-3 rounded-xl text-base font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}