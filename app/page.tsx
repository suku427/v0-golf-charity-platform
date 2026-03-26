import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="font-serif text-lg font-bold text-primary-foreground">B4</span>
            </div>
            <span className="font-serif text-xl font-semibold">Birdies4Good</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance font-serif text-4xl font-bold tracking-tight sm:text-6xl">
                Play Golf.{" "}
                <span className="text-primary">Win Big.</span>{" "}
                <span className="text-secondary">Give Back.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Join thousands of golfers who are transforming their rounds into real impact. Track your scores, enter monthly prize draws, and support the charities you care about.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/auth/sign-up">
                    Start Your Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">See How It Works</Link>
                </Button>
              </div>

              <div className="mt-12 grid max-w-4xl gap-6 mx-auto sm:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
                  <div className="font-serif text-3xl font-bold text-primary">$50K+</div>
                  <div className="text-sm text-muted-foreground mt-2">Monthly Prizes</div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
                  <div className="font-serif text-3xl font-bold text-secondary">$2.5M</div>
                  <div className="text-sm text-muted-foreground mt-2">Donated to Charity</div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
                  <div className="font-serif text-3xl font-bold text-success">12K+</div>
                  <div className="text-sm text-muted-foreground mt-2">Active Members</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Birdies4Good. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
