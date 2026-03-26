import { UserPlus, Target, Trophy, Heart } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Join & Subscribe",
    description: "Sign up and choose your subscription plan. Your membership automatically enters you into monthly prize draws.",
  },
  {
    icon: Target,
    title: "Play & Track",
    description: "Log your golf scores after each round. Our rolling 5-round average determines your draw eligibility and bonus entries.",
  },
  {
    icon: Trophy,
    title: "Win Prizes",
    description: "Every month, our fair draw system selects winners. The more you play and improve, the better your chances.",
  },
  {
    icon: Heart,
    title: "Give Back",
    description: "Choose which charity receives your portion of the giving pool. See your impact grow with every subscription.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Four simple steps to transform your golf game into meaningful impact
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connection line - desktop only */}
          <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-border lg:block" />
          
          <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary font-serif text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 max-w-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
