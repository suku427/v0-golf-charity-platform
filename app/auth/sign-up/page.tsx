"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "birdie"
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          selected_plan: plan,
        },
      },
    })

    if (error) {
      setLoading(false)
      toast.error("Sign up failed", {
        description: error.message,
      })
      return
    }

    router.push("/auth/sign-up-success")
  }

  return (
    <form onSubmit={handleSignUp}>
      <CardContent className="space-y-4">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="given-name"
              />
              {errors.firstName && <FieldError>{errors.firstName}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                autoComplete="family-name"
              />
              {errors.lastName && <FieldError>{errors.lastName}</FieldError>}
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Spinner className="mr-2" /> : null}
          {loading ? "Creating account..." : "Create Account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our{" "}
          <Link href="#" className="underline hover:text-foreground">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </CardFooter>
    </form>
  )
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(200,170,100,0.1),transparent)]" />
      </div>

      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="font-serif text-lg font-bold text-primary-foreground">B4</span>
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight">Birdies4Good</span>
          </Link>
          <CardTitle className="font-serif text-2xl">Create your account</CardTitle>
          <CardDescription>Start your journey of giving back</CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center"><Spinner /></div>}>
          <SignUpForm />
        </Suspense>
      </Card>
    </div>
  )
}
