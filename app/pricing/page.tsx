'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { SUBSCRIPTION_PRODUCTS, formatPrice } from '@/lib/products'
import { createCheckoutSession } from '@/app/actions/stripe'

export const metadata = {
  title: 'Pricing - Birdies4Good',
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const products = SUBSCRIPTION_PRODUCTS.filter(
    p => p.billingPeriod === billingPeriod
  )

  const tiers = ['birdie', 'eagle', 'albatross'] as const

  const handleCheckout = async (productId: string) => {
    setLoading(productId)
    try {
      await createCheckoutSession(productId)
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen py-12" style={{backgroundColor: '#1a1a2e', color: '#faf9f6'}}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p style={{color: '#bfb8af'}} className="text-lg max-w-2xl mx-auto">
            Choose the plan that matches your golfing ambitions. All plans include unlimited score tracking and monthly draws.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center gap-4 mb-12">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('monthly')}
            style={billingPeriod === 'monthly' ? {backgroundColor: '#c89a4a', color: '#1a1a2e'} : {}}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('yearly')}
            style={billingPeriod === 'yearly' ? {backgroundColor: '#c89a4a', color: '#1a1a2e'} : {}}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">Save up to 15%</Badge>
          </Button>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {tiers.map((tier) => {
            const product = products.find(p => p.tier === tier)
            if (!product) return null

            const isPopular = tier === 'eagle'

            return (
              <Card
                key={tier}
                className="overflow-hidden"
                style={{
                  borderColor: isPopular ? '#c89a4a' : '#2a2a3e',
                  backgroundColor: isPopular ? 'rgba(200, 154, 74, 0.1)' : 'transparent'
                }}
              >
                <CardHeader>
                  {isPopular && (
                    <Badge style={{backgroundColor: '#c89a4a', color: '#1a1a2e'}} className="w-fit mb-3">
                      Most Popular
                    </Badge>
                  )}
                  <CardTitle className="font-serif text-2xl capitalize">{tier}</CardTitle>
                  <CardDescription style={{color: '#bfb8af'}}>{product.description}</CardDescription>
                  <div className="mt-4">
                    <span className="font-serif text-4xl font-bold">{formatPrice(product.priceInCents)}</span>
                    <span style={{color: '#bfb8af'}}> /{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    className="w-full"
                    style={isPopular ? {backgroundColor: '#c89a4a', color: '#1a1a2e'} : undefined}
                    disabled={loading === product.id}
                    onClick={() => handleCheckout(product.id)}
                  >
                    {loading === product.id ? 'Processing...' : 'Get Started'}
                  </Button>

                  <div className="space-y-3">
                    {product.features.map((feature) => (
                      <div key={feature} className="flex gap-3 items-start">
                        <Check className="h-5 w-5" style={{color: '#6cb568'}} />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan?</h3>
              <p style={{color: '#bfb8af'}} className="text-sm">Yes! You can upgrade or downgrade your plan anytime from your dashboard. Changes take effect at the end of your billing cycle.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens when I cancel?</h3>
              <p style={{color: '#bfb8af'}} className="text-sm">Your membership ends at the end of the current billing period. You&apos;ll still have access to your score history and donated amounts.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p style={{color: '#bfb8af'}} className="text-sm">We offer a 7-day money-back guarantee if you&apos;re not satisfied. Contact support@birdies4good.com for refund requests.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
