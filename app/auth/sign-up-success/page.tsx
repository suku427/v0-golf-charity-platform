import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(200,170,100,0.1),transparent)]" />
      </div>

      <Card className="w-full max-w-md border-border/50 bg-card/50 text-center backdrop-blur-sm">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <CardTitle className="font-serif text-2xl">Check your email</CardTitle>
          <CardDescription>
            {"We've sent you a confirmation link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Click the link in your email to verify your account and complete your registration. 
            The link will expire in 24 hours.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/login">
              Back to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            {"Didn't receive the email? Check your spam folder or "}
            <Link href="/auth/sign-up" className="text-primary hover:underline">try again</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
