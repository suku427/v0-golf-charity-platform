"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import { Check, CreditCard } from "lucide-react"

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  handicap_index: number | null
  phone: string | null
}

type SubscriptionPlan = {
  id: string
  name: string
  price: number
  draw_entries: number
  features: string[] | null
}

type Subscription = {
  id: string
  status: string
  subscription_plans: SubscriptionPlan
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    handicapIndex: "",
    phone: "",
  })

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useSWR<Profile>("profile-settings", async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    return data
  })

  // Fetch subscription
  const { data: subscription } = useSWR<Subscription | null>("subscription-settings", async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()
    return data
  })

  // Fetch plans
  const { data: plans } = useSWR<SubscriptionPlan[]>("plans", async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price")
    return data ?? []
  })

  // Initialize form
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name ?? "",
        lastName: profile.last_name ?? "",
        handicapIndex: profile.handicap_index?.toString() ?? "",
        phone: profile.phone ?? "",
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error("You must be logged in")
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        handicap_index: formData.handicapIndex ? parseFloat(formData.handicapIndex) : null,
        phone: formData.phone || null,
      })
      .eq("id", user.id)

    if (error) {
      toast.error("Failed to update profile", { description: error.message })
      setSaving(false)
      return
    }

    await mutate("profile-settings")
    toast.success("Profile updated!")
    setSaving(false)
  }

  const handleSubscribe = async (planId: string) => {
    // In production, this would redirect to Stripe checkout
    toast.info("Subscription flow", {
      description: "In production, this would redirect to Stripe checkout",
    })
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and subscription
        </p>
      </div>

      {/* Profile */}
      <Card>
        <form onSubmit={handleSaveProfile}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="handicapIndex">Handicap Index</FieldLabel>
                  <Input
                    id="handicapIndex"
                    name="handicapIndex"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.5"
                    value={formData.handicapIndex}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner className="mr-2" /> : null}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Subscription */}
      <Card id="subscription">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>
            {subscription 
              ? `You're on the ${subscription.subscription_plans.name} plan`
              : "Choose a plan to enter monthly draws"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans?.map((plan) => {
              const isCurrentPlan = subscription?.subscription_plans.id === plan.id
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-5 ${
                    isCurrentPlan 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-border/80"
                  }`}
                >
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2 right-4 bg-primary">Current</Badge>
                  )}
                  <p className="font-serif text-xl font-bold">{plan.name}</p>
                  <p className="mt-1">
                    <span className="font-serif text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {plan.draw_entries} draw {plan.draw_entries === 1 ? "entry" : "entries"}/month
                  </p>
                  {plan.features && (
                    <ul className="mt-4 space-y-2">
                      {(plan.features as string[]).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    className="mt-4 w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isCurrentPlan ? "Current Plan" : "Subscribe"}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
