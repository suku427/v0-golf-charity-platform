'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getProductById } from '@/lib/products'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(productId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const product = getProductById(productId)
  if (!product) {
    throw new Error('Product not found')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
            recurring:
              product.billingPeriod === 'monthly'
                ? { interval: 'month', interval_count: 1 }
                : { interval: 'year', interval_count: 1 },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        productId: productId,
        tier: product.tier,
        billingPeriod: product.billingPeriod,
      },
    })

    if (!session.url) {
      throw new Error('Failed to create checkout session')
    }

    redirect(session.url)
  } catch (error) {
    console.error('Checkout error:', error)
    throw error
  }
}

export async function getSubscriptionStatus() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(name, tier, price_monthly, price_yearly)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return subscription
}
