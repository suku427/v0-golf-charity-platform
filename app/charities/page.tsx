import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, ExternalLink, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Our Charity Partners",
  description: "Explore the charities supported by Birdies4Good members",
}

export default async function CharitiesPage() {
  const supabase = await createClient()

  // Get all active charities with donation totals
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("name")

  // Get donation totals
  const { data: donations } = await supabase
    .from("charity_donations")
    .select("charity_id, amount")

  const donationsByCharity = donations?.reduce((acc, d) => {
    acc[d.charity_id] = (acc[d.charity_id] ?? 0) + Number(d.amount)
    return acc
  }, {} as Record<string, number>) ?? {}

  // Get unique categories
  const categories = [...new Set(charities?.map(c => c.category).filter(Boolean))]

  const totalDonated = Object.values(donationsByCharity).reduce((sum, v) => sum + v, 0)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
                <Heart className="h-4 w-4" />
                <span>{charities?.length ?? 0} charity partners</span>
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                Our Charity Partners
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Every Birdies4Good subscription supports these amazing organizations. 
                Together, we&apos;ve donated over ${totalDonated.toLocaleString()} to causes that matter.
              </p>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <p className="font-serif text-4xl font-bold text-secondary">{charities?.length ?? 0}</p>
                <p className="mt-1 text-sm text-muted-foreground">Charity Partners</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <p className="font-serif text-4xl font-bold text-primary">${totalDonated.toLocaleString()}</p>
                <p className="mt-1 text-sm text-muted-foreground">Total Donated</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <p className="font-serif text-4xl font-bold">{categories.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Focus Areas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Charity Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-sm">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {charities?.map((charity) => (
                <Card key={charity.id} className="flex flex-col transition-colors hover:bg-muted/50">
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/20">
                      <Heart className="h-7 w-7 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold">{charity.name}</h3>
                    {charity.category && (
                      <Badge variant="outline" className="mt-2 w-fit">
                        {charity.category}
                      </Badge>
                    )}
                    {charity.description && (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {charity.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                      <div>
                        <p className="font-serif text-lg font-bold text-success">
                          ${(donationsByCharity[charity.id] ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">donated</p>
                      </div>
                      {charity.website_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={charity.website_url} target="_blank" rel="noopener noreferrer">
                            Visit <ExternalLink className="ml-1 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!charities || charities.length === 0) && (
              <div className="py-12 text-center">
                <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg text-muted-foreground">No charities available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Make a Difference?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join Birdies4Good and start supporting these amazing charities with every round you play.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
