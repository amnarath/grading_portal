import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getProductByPriceId, formatPrice } from '../stripe-config';

interface SubscriptionData {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export default function UserSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setSubscription(data);
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'trialing':
        return 'text-blue-400';
      case 'past_due':
      case 'unpaid':
        return 'text-red-400';
      case 'canceled':
        return 'text-gray-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'past_due':
      case 'unpaid':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-medium">Error Loading Subscription</h3>
        </div>
        <p className="text-pikamon-dark-muted text-sm">{error}</p>
      </div>
    );
  }

  if (!subscription || !subscription.subscription_id) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 text-pikamon-dark-muted mb-2">
          <CreditCard className="w-5 h-5" />
          <h3 className="font-medium">No Active Subscription</h3>
        </div>
        <p className="text-pikamon-dark-muted text-sm">
          You don't have any active subscriptions at the moment.
        </p>
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-pikamon-accent" />
        <h3 className="text-lg font-medium text-white">Current Subscription</h3>
      </div>

      <div className="space-y-4">
        {/* Subscription Status */}
        <div className="flex items-center justify-between">
          <span className="text-pikamon-dark-muted">Status</span>
          <div className={`flex items-center gap-2 ${getStatusColor(subscription.subscription_status)}`}>
            {getStatusIcon(subscription.subscription_status)}
            <span className="font-medium capitalize">
              {subscription.subscription_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Product Information */}
        {product && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-pikamon-dark-muted">Plan</span>
              <span className="text-white font-medium">{product.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-pikamon-dark-muted">Price</span>
              <span className="text-white font-medium">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
          </>
        )}

        {/* Billing Period */}
        {subscription.current_period_start && subscription.current_period_end && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-pikamon-dark-muted">Current Period</span>
              <div className="text-right">
                <div className="text-white text-sm">
                  {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-pikamon-dark-muted">Next Billing</span>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(subscription.current_period_end)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="flex items-center justify-between">
            <span className="text-pikamon-dark-muted">Payment Method</span>
            <span className="text-white">
              {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
            </span>
          </div>
        )}

        {/* Cancellation Notice */}
        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-900/20 border border-yellow-500/20 text-yellow-300 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Your subscription will cancel at the end of the current billing period.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}