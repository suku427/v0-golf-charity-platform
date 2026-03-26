import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Birdie",
    price: 19,
    description: "Perfect for casual golfers who want to give back",
    features: [
      "1 monthly draw entry",
      "Score tracking & analytics",
      "Choose your charity",
      "Member community access",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Eagle",
    price: 39,
    description: "For dedicated golfers seeking more chances to win",
    features: [
      "3 monthly draw entries",
      "Bonus entries for score improvement",
      "Advanced analytics dashboard",
      "Priority charity allocation",
      "Exclusive member events",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Albatross",
    price: 79,
    description: "Maximum impact for serious golf enthusiasts",
    features: [
      "7 monthly draw entries",
      "Double bonus entries",
      "Premium analytics & coaching tips",
      "VIP charity experiences",
      "Exclusive prize draws",
      "Dedicated account manager",
      "Annual charity golf outing",
    ],
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your Impact Level
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Every tier gives back. The more you commit, the more you win and the more you give.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.featured
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border/50"
              }`}
            >
              {plan.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="mb-6 text-center">
                  <span className="font-serif text-5xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
                  asChild
                >
                  <Link href={`/auth/sign-up?plan=${plan.name.toLowerCase()}`}>
                    Get Started
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Guarantee */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. Cancel anytime, no questions asked.
        </p>
      </div>
    </section>
  )
}
