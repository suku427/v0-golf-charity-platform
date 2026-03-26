import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Trophy, TrendingUp } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(200,170,100,0.15),transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="h-4 w-4" />
            <span>Over $2.5M donated to charity</span>
          </div>

          {/* Headline */}
          <h1 className="text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Play Golf.{" "}
            <span className="text-primary">Win Big.</span>{" "}
            <span className="text-secondary">Give Back.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Join thousands of golfers who are transforming their rounds into real impact. 
            Track your scores, enter monthly prize draws, and support the charities you care about.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/auth/sign-up">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Trusted by 12,000+ golfers</p>
              <p className="text-sm text-muted-foreground">Supporting 45+ charities nationwide</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard
            icon={<Trophy className="h-6 w-6 text-primary" />}
            value="$50K+"
            label="Monthly Prizes"
          />
          <StatCard
            icon={<Heart className="h-6 w-6 text-secondary" />}
            value="$2.5M"
            label="Donated to Charity"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-success" />}
            value="15%"
            label="Avg. Handicap Improvement"
          />
        </div>
      </div>
    </section>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
      {icon}
      <span className="font-serif text-3xl font-bold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
