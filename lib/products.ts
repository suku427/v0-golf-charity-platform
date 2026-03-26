export interface SubscriptionProduct {
  id: string
  name: string
  description: string
  tier: 'birdie' | 'eagle' | 'albatross'
  billingPeriod: 'monthly' | 'yearly'
  priceInCents: number
  monthlyEquivalent: number
  features: string[]
}

export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  // Birdie Tier
  {
    id: 'plan_birdie_monthly',
    name: 'Birdie Monthly',
    description: 'Monthly golf scoring and draws',
    tier: 'birdie',
    billingPeriod: 'monthly',
    priceInCents: 1900,
    monthlyEquivalent: 1900,
    features: [
      'Unlimited score entries',
      'Monthly prize draws',
      'Charity selection',
      'Email notifications',
      'Basic stats dashboard'
    ]
  },
  {
    id: 'plan_birdie_yearly',
    name: 'Birdie Yearly',
    description: 'Annual golf scoring and draws (Save 8%)',
    tier: 'birdie',
    billingPeriod: 'yearly',
    priceInCents: 20900,
    monthlyEquivalent: 1741,
    features: [
      'Unlimited score entries',
      'Monthly prize draws',
      'Charity selection',
      'Email notifications',
      'Basic stats dashboard',
      '8% annual savings'
    ]
  },
  // Eagle Tier
  {
    id: 'plan_eagle_monthly',
    name: 'Eagle Monthly',
    description: 'Enhanced features and bigger prize pools',
    tier: 'eagle',
    billingPeriod: 'monthly',
    priceInCents: 3900,
    monthlyEquivalent: 3900,
    features: [
      'Everything in Birdie',
      '2x prize pool',
      'Advanced analytics',
      'Leaderboards',
      'Priority support',
      'Custom charity bundles'
    ]
  },
  {
    id: 'plan_eagle_yearly',
    name: 'Eagle Yearly',
    description: 'Annual enhanced membership (Save 12%)',
    tier: 'eagle',
    billingPeriod: 'yearly',
    priceInCents: 43200,
    monthlyEquivalent: 3600,
    features: [
      'Everything in Birdie',
      '2x prize pool',
      'Advanced analytics',
      'Leaderboards',
      'Priority support',
      'Custom charity bundles',
      '12% annual savings'
    ]
  },
  // Albatross Tier
  {
    id: 'plan_albatross_monthly',
    name: 'Albatross Monthly',
    description: 'Premium VIP experience with exclusive benefits',
    tier: 'albatross',
    billingPeriod: 'monthly',
    priceInCents: 7900,
    monthlyEquivalent: 7900,
    features: [
      'Everything in Eagle',
      '4x prize pool',
      'VIP member status',
      'Exclusive tournaments',
      'Dedicated account manager',
      '20% charity donation match',
      'Quarterly gifts & perks'
    ]
  },
  {
    id: 'plan_albatross_yearly',
    name: 'Albatross Yearly',
    description: 'Annual VIP membership (Save 15%)',
    tier: 'albatross',
    billingPeriod: 'yearly',
    priceInCents: 90000,
    monthlyEquivalent: 7500,
    features: [
      'Everything in Eagle',
      '4x prize pool',
      'VIP member status',
      'Exclusive tournaments',
      'Dedicated account manager',
      '20% charity donation match',
      'Quarterly gifts & perks',
      '15% annual savings'
    ]
  }
]

export function getProductById(id: string): SubscriptionProduct | undefined {
  return SUBSCRIPTION_PRODUCTS.find(p => p.id === id)
}

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`
}
