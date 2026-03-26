import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Trophy, Heart, DollarSign, TrendingUp, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Admin Dashboard",
}

async function getAdminStats() {
  const supabase = await createClient()
  
  // Get user count
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Get active subscriptions
  const { count: subCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  // Get total donations
  const { data: donations } = await supabase
    .from("charity_donations")
    .select("amount")

  const totalDonated = donations?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0

  // Get charity count
  const { count: charityCount } = await supabase
    .from("charities")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  // Get current draw
  const { data: currentDraw } = await supabase
    .from("draws")
    .select("*")
    .eq("status", "open")
    .single()

  // Get recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*, subscriptions(*, subscription_plans(*))")
    .order("created_at", { ascending: false })
    .limit(5)

  return { userCount, subCount, totalDonated, charityCount, currentDraw, recentUsers }
}

export default async function AdminPage() {
  const { userCount, subCount, totalDonated, charityCount, currentDraw, recentUsers } = await getAdminStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Total Users"
          value={(userCount ?? 0).toLocaleString()}
          href="/admin/users"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          label="Active Subscriptions"
          value={(subCount ?? 0).toLocaleString()}
          href="/admin/users"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          label="Total Donated"
          value={`$${totalDonated.toLocaleString()}`}
          href="/admin/charities"
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-secondary" />}
          label="Active Charities"
          value={(charityCount ?? 0).toString()}
          href="/admin/charities"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Draw */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Current Draw
              </CardTitle>
              <CardDescription>
                {currentDraw 
                  ? `Draw date: ${new Date(currentDraw.draw_date).toLocaleDateString()}`
                  : "No active draw"
                }
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/draws">Manage Draws</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {currentDraw ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                  <p className="mt-1 font-serif text-2xl font-bold text-primary">
                    ${Number(currentDraw.prize_pool).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Charity Pool</p>
                  <p className="mt-1 font-serif text-2xl font-bold text-secondary">
                    ${Number(currentDraw.charity_pool).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="mt-1 font-serif text-2xl font-bold capitalize">
                    {currentDraw.status}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No draw is currently active</p>
                <Button className="mt-4" asChild>
                  <Link href="/admin/draws">Create Draw</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest sign-ups</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {user.subscriptions?.[0]?.subscription_plans?.name ? (
                      <span className="text-success">{user.subscriptions[0].subscription_plans.name}</span>
                    ) : (
                      <span className="text-muted-foreground">No subscription</span>
                    )}
                  </div>
                </div>
              ))}
              {(!recentUsers || recentUsers.length === 0) && (
                <p className="py-8 text-center text-muted-foreground">No users yet</p>
              )}
            </div>
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
  href
}: { 
  icon: React.ReactNode
  label: string
  value: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
