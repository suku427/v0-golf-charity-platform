import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Target, Trophy, Heart, TrendingUp, Calendar, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Dashboard",
}

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  
  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, charities(*)")
    .eq("id", userId)
    .single()

  // Get subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, subscription_plans(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  // Get recent scores
  const { data: scores } = await supabase
    .from("golf_scores")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(5)

  // Get current draw
  const { data: currentDraw } = await supabase
    .from("draws")
    .select("*")
    .gte("draw_date", new Date().toISOString().split("T")[0])
    .order("draw_date", { ascending: true })
    .limit(1)
    .single()

  // Get user draw entries
  const { data: drawEntries } = await supabase
    .from("draw_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("draw_id", currentDraw?.id)

  // Get total charity donations
  const { data: donations } = await supabase
    .from("charity_donations")
    .select("amount")
    .eq("user_id", userId)

  const totalDonated = donations?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0

  return { profile, subscription, scores, currentDraw, drawEntries, totalDonated }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { profile, subscription, scores, currentDraw, drawEntries, totalDonated } = await getDashboardData(user.id)

  const firstName = profile?.first_name ?? user.user_metadata?.first_name ?? "there"
  const rollingAverage = profile?.rolling_average ?? 0
  const entryCount = drawEntries?.length ?? 0

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Welcome back, {firstName}</h1>
          <p className="mt-1 text-muted-foreground">
            {"Here's what's happening with your golf and giving."}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/scores/new">
            <Target className="mr-2 h-4 w-4" />
            Log a Round
          </Link>
        </Button>
      </div>

      {/* Subscription Status */}
      {!subscription && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
            <div>
              <h3 className="font-semibold">Complete Your Membership</h3>
              <p className="text-sm text-muted-foreground">
                Subscribe to enter monthly draws and start giving back
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/settings#subscription">Choose a Plan</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5 text-primary" />}
          label="Rolling Average"
          value={rollingAverage ? rollingAverage.toFixed(1) : "—"}
          sublabel={scores?.length ? `${scores.length} rounds logged` : "No rounds yet"}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-primary" />}
          label="Draw Entries"
          value={entryCount.toString()}
          sublabel={subscription ? `${subscription.subscription_plans?.name} tier` : "No subscription"}
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-secondary" />}
          label="Total Given"
          value={`$${totalDonated.toFixed(0)}`}
          sublabel={profile?.charities?.name ?? "No charity selected"}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
          label="Next Draw"
          value={currentDraw ? new Date(currentDraw.draw_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
          sublabel={currentDraw?.status === "open" ? "Entries open" : "Coming soon"}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Scores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Scores</CardTitle>
              <CardDescription>Your last 5 rounds</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/scores">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {scores && scores.length > 0 ? (
              <div className="space-y-3">
                {scores.map((score) => (
                  <div key={score.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div>
                      <p className="font-medium">{score.course_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(score.played_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl font-bold">{score.gross_score}</p>
                      <p className="text-xs text-muted-foreground">gross</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No rounds logged yet</p>
                <Button variant="link" className="mt-2" asChild>
                  <Link href="/dashboard/scores/new">Log your first round</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charity Impact */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Impact</CardTitle>
              <CardDescription>Charity contributions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/charity">
                Manage <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {profile?.charities ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border border-border/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{profile.charities.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.charities.category}</p>
                  </div>
                  <Badge variant="secondary">${totalDonated}</Badge>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span>Your contributions are making a difference!</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Heart className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No charity selected</p>
                <Button variant="link" className="mt-2" asChild>
                  <Link href="/dashboard/charity">Choose a charity</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  sublabel 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  sublabel: string 
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <p className="mt-3 font-serif text-3xl font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>
      </CardContent>
    </Card>
  )
}
