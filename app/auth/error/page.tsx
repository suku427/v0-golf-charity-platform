import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(200,100,100,0.1),transparent)]" />
      </div>

      <Card className="w-full max-w-md border-border/50 bg-card/50 text-center backdrop-blur-sm">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="font-serif text-2xl">Authentication Error</CardTitle>
          <CardDescription>Something went wrong</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We encountered an error while processing your request. This could be due to an expired 
            link, invalid credentials, or a temporary issue with our system.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
