import React, { useState } from 'react';
import { stripeProducts, formatPrice, type StripeProduct } from '../stripe-config';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Loader2, Package, CreditCard } from 'lucide-react';

export default function ProductCatalog() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (product: StripeProduct) => {
    try {
      setLoading(product.id);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please sign in to make a purchase');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/products`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to initiate purchase');
    } finally {
      setLoading(null);
    }
  };

  const groupedProducts = stripeProducts.reduce((acc, product) => {
    const category = getProductCategory(product.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, StripeProduct[]>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Product Catalog</h1>
        <p className="text-pikamon-dark-muted">Browse and purchase our available products</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {Object.entries(groupedProducts).map(([category, products]) => (
        <div key={category} className="space-y-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            {category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="glass-card rounded-xl overflow-hidden hover-glow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-pikamon-dark-muted text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-pikamon-accent">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    <span className="text-xs text-pikamon-dark-muted uppercase tracking-wide">
                      {product.mode === 'payment' ? 'One-time' : 'Subscription'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(product)}
                    disabled={loading === product.id}
                    className="w-full glass-button py-3 rounded-lg text-base font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === product.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {product.mode === 'payment' ? (
                          <ShoppingCart className="w-4 h-4" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        {product.mode === 'payment' ? 'Buy Now' : 'Subscribe'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getProductCategory(productName: string): string {
  const name = productName.toLowerCase();
  
  if (name.includes('pokemon') || name.includes('sv0') || name.includes('booster') || name.includes('flareon') || name.includes('151')) {
    return 'Pokemon Cards';
  }
  
  if (name.includes('welder') || name.includes('laser')) {
    return 'Tools & Equipment';
  }
  
  if (name.includes('shipping')) {
    return 'Services';
  }
  
  if (name.includes('logo') || name.includes('design')) {
    return 'Digital Services';
  }
  
  return 'Other Products';
}