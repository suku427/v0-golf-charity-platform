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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const newErrors: typeof errors = {}
    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      toast.error("Login failed", {
        description: error.message,
      })
      return
    }

    toast.success("Welcome back!")
    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Spinner className="mr-2" /> : null}
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </form>
  )
}

export default function LoginPage() {
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
          <CardTitle className="font-serif text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center"><Spinner /></div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  )
}
