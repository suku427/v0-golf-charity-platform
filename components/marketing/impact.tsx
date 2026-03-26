import { Card, CardContent } from "@/components/ui/card"

const charities = [
  { name: "Youth Golf Foundation", donated: "$450,000", focus: "Youth Programs" },
  { name: "First Tee", donated: "$380,000", focus: "Youth Development" },
  { name: "Wounded Warrior Project", donated: "$320,000", focus: "Veterans" },
  { name: "St. Jude Children's Research", donated: "$280,000", focus: "Healthcare" },
  { name: "Special Olympics", donated: "$250,000", focus: "Inclusion" },
  { name: "American Cancer Society", donated: "$220,000", focus: "Research" },
]

export function Impact() {
  return (
    <section id="impact" className="bg-card/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-secondary">
            Making a Difference
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Real Impact, Real Change
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Every subscription contributes to causes that matter. See where your membership makes a difference.
          </p>
        </div>

        {/* Impact Stats */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ImpactStat value="$2.5M+" label="Total Donated" />
          <ImpactStat value="45+" label="Charities Supported" />
          <ImpactStat value="12,000+" label="Active Members" />
          <ImpactStat value="150,000+" label="Rounds Logged" />
        </div>

        {/* Charity Grid */}
        <div className="mt-16">
          <h3 className="mb-8 text-center text-xl font-semibold">Featured Charity Partners</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {charities.map((charity) => (
              <Card key={charity.name} className="border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:bg-card">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-medium">{charity.name}</p>
                    <p className="text-sm text-muted-foreground">{charity.focus}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg font-bold text-success">{charity.donated}</p>
                    <p className="text-xs text-muted-foreground">donated</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
      <p className="font-serif text-4xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
