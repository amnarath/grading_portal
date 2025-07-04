export const stripeProducts = [
  {
    id: 'prod_RoBE2gQb9MALCy',
    priceId: 'price_1QuYsLDbqXbu8HsFepTQpix9',
    name: 'W65 max mini Laser Spot Welder. 200W - Sky Blue',
    description: 'Professional mini laser spot welder with 200W power output in sky blue color',
    price: 3550.00,
    currency: 'EUR',
    mode: 'payment' as const
  },
  {
    id: 'prod_RkQreEfKIpRsCx',
    priceId: 'price_1QqvzyDbqXbu8HsF13yzgHWf',
    name: 'Shipping charge',
    description: 'Standard shipping fee for orders',
    price: 11.49,
    currency: 'EUR',
    mode: 'payment' as const
  },
  {
    id: 'prod_RkQpBvZv4b5JSM',
    priceId: 'price_1Qqvy6DbqXbu8HsFhvQGrQJN',
    name: 'Flareon VMAX Gift Box',
    description: 'Pokemon Flareon VMAX Gift Box collection',
    price: 169.50,
    currency: 'EUR',
    mode: 'payment' as const
  },
  {
    id: 'prod_RZiHlrvDSFNsXq',
    priceId: 'price_1QgYqbDbqXbu8HsF1Fctg4dp',
    name: 'Pokemon SV06 Booster Box EAN: 820650877742 ASIN: B0CYB4XYZL',
    description: 'Pokemon SV06 Booster Box - Official Trading Card Game',
    price: 120.00,
    currency: 'USD',
    mode: 'payment' as const
  },
  {
    id: 'prod_RZaIOTB8KANnKN',
    priceId: 'price_1QgR7fDbqXbu8HsFnLb8H1iv',
    name: 'SV02 Booster Box Case [second distro]',
    description: 'Pokemon SV02 Booster Box Case - Second Distribution',
    price: 750.00,
    currency: 'EUR',
    mode: 'payment' as const
  },
  {
    id: 'prod_RZaHzoo7IHn0KX',
    priceId: 'price_1QgR79DbqXbu8HsFh3mCY9MJ',
    name: 'SV02 Booster Box Case',
    description: 'Pokemon SV02 Booster Box Case - First Distribution',
    price: 740.00,
    currency: 'EUR',
    mode: 'payment' as const
  },
  {
    id: 'prod_RYB7KeEMvRJUWJ',
    priceId: 'price_1Qf4lZDbqXbu8HsFoXUobn5m',
    name: 'SV06 Booster Box',
    description: 'Pokemon SV06 Booster Box - Single Box',
    price: 120.00,
    currency: 'USD',
    mode: 'payment' as const
  },
  {
    id: 'prod_RWHQMiVWqwCNyG',
    priceId: 'price_1QdErBDbqXbu8HsFphOi6UPN',
    name: 'SV05 Case (6 booster boxes)',
    description: 'Pokemon SV05 Case containing 6 booster boxes',
    price: 730.00,
    currency: 'USD',
    mode: 'payment' as const
  },
  {
    id: 'prod_RWH6cLOPz2n5SW',
    priceId: 'price_1QdEY6DbqXbu8HsFEv6YkXRW',
    name: 'SV06 Case (6 booster boxes)',
    description: 'Pokemon SV06 Case containing 6 booster boxes',
    price: 720.00,
    currency: 'USD',
    mode: 'payment' as const
  },
  {
    id: 'prod_RNKjFUa5y7eXcA',
    priceId: 'price_1QUa47DbqXbu8HsF6hkPd3M8',
    name: 'Costco 151 collection',
    description: 'Pokemon 151 collection available at Costco',
    price: 73.00,
    currency: 'EUR',
    mode: 'payment' as const
  },
  {
    id: 'prod_QwkDCjR0JW0i55',
    priceId: 'price_1Q4qipDbqXbu8HsFi4wlgH5t',
    name: 'Logo Design 3DPrintForce - full digital files',
    description: 'Complete logo design package with full digital files for 3DPrintForce',
    price: 100.00,
    currency: 'USD',
    mode: 'payment' as const
  }
] as const;

export type StripeProduct = typeof stripeProducts[number];

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}