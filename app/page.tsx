import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#1a1a2e', color: '#faf9f6'}}>
      {/* Header */}
      <header className="border-b" style={{borderColor: '#2a2a3e'}}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{backgroundColor: '#c89a4a'}}>
              <span className="text-lg font-bold" style={{color: '#1a1a2e'}}>B4</span>
            </div>
            <span className="text-xl font-semibold">Birdies4Good</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button asChild style={{backgroundColor: '#c89a4a', color: '#1a1a2e'}}>
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
                <span style={{color: '#c89a4a'}}>Win Big.</span>{" "}
                <span style={{color: '#4a8a8a'}}>Give Back.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{color: '#bfb8af'}}>
                Join thousands of golfers who are transforming their rounds into real impact. Track your scores, enter monthly prize draws, and support the charities you care about.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="gap-2" asChild style={{backgroundColor: '#c89a4a', color: '#1a1a2e'}}>
                  <Link href="/auth/sign-up">
                    Start Your Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild style={{borderColor: '#2a2a3e', color: '#faf9f6'}}>
                  <Link href="#features">See How It Works</Link>
                </Button>
              </div>

              <div className="mt-12 grid max-w-4xl gap-6 mx-auto sm:grid-cols-3">
                <div className="rounded-2xl border p-6" style={{borderColor: '#2a2a3e', backgroundColor: 'rgba(42, 42, 62, 0.4)'}}>
                  <div className="font-serif text-3xl font-bold" style={{color: '#c89a4a'}}>$50K+</div>
                  <div className="text-sm mt-2" style={{color: '#bfb8af'}}>Monthly Prizes</div>
                </div>
                <div className="rounded-2xl border p-6" style={{borderColor: '#2a2a3e', backgroundColor: 'rgba(42, 42, 62, 0.4)'}}>
                  <div className="font-serif text-3xl font-bold" style={{color: '#4a8a8a'}}>$2.5M</div>
                  <div className="text-sm mt-2" style={{color: '#bfb8af'}}>Donated to Charity</div>
                </div>
                <div className="rounded-2xl border p-6" style={{borderColor: '#2a2a3e', backgroundColor: 'rgba(42, 42, 62, 0.4)'}}>
                  <div className="font-serif text-3xl font-bold" style={{color: '#6cb568'}}>12K+</div>
                  <div className="text-sm mt-2" style={{color: '#bfb8af'}}>Active Members</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8" style={{borderColor: '#2a2a3e', backgroundColor: 'rgba(42, 42, 62, 0.3)'}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm" style={{color: '#bfb8af'}}>
          <p>&copy; {new Date().getFullYear()} Birdies4Good. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
