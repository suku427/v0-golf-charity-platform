import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty } from "@/components/ui/empty"
import { Trophy, Calendar, Ticket, Star } from "lucide-react"

export const metadata = {
  title: "Prize Draws",
}

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get subscription for entry count
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, subscription_plans(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  // Get all draws
  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("draw_date", { ascending: false })

  // Get user entries
  const { data: entries } = await supabase
    .from("draw_entries")
    .select("*, draws(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get user wins
  const { data: wins } = await supabase
    .from("winners")
    .select("*, draws(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Group entries by draw
  const entriesByDraw = entries?.reduce((acc, entry) => {
    acc[entry.draw_id] = (acc[entry.draw_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  // Current month draw
  const currentDraw = draws?.find(d => d.status === "open")
  const currentEntries = currentDraw ? entriesByDraw[currentDraw.id] || 0 : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Prize Draws</h1>
        <p className="mt-1 text-muted-foreground">
          Your entries and draw history
        </p>
      </div>

      {/* Current Draw */}
      {currentDraw ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle>Current Draw</CardTitle>
            </div>
            <CardDescription>
              Draw date: {new Date(currentDraw.draw_date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-lg border border-border/50 bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Prize Pool</p>
                <p className="mt-1 font-serif text-3xl font-bold text-primary">
                  ${Number(currentDraw.prize_pool).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Your Entries</p>
                <p className="mt-1 font-serif text-3xl font-bold">{currentEntries}</p>
                {subscription && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {subscription.subscription_plans?.draw_entries} base + bonuses
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-2" variant="default">
                  {currentDraw.status === "open" ? "Entries Open" : currentDraw.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No active draw</p>
            <p className="text-sm text-muted-foreground">Check back soon for the next monthly draw</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Entries</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">{entries?.length ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Lifetime entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Draws Entered</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">
              {Object.keys(entriesByDraw).length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Monthly draws</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Wins</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">{wins?.length ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Prize wins</p>
          </CardContent>
        </Card>
      </div>

      {/* Past Draws */}
      <Card>
        <CardHeader>
          <CardTitle>Draw History</CardTitle>
          <CardDescription>Past draws and your participation</CardDescription>
        </CardHeader>
        <CardContent>
          {draws && draws.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draw Date</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead className="text-right">Your Entries</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((draw) => {
                  const userEntries = entriesByDraw[draw.id] || 0
                  const userWin = wins?.find(w => w.draw_id === draw.id)
                  return (
                    <TableRow key={draw.id}>
                      <TableCell>
                        {new Date(draw.draw_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(draw.prize_pool).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{userEntries}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          draw.status === "completed" ? "secondary" :
                          draw.status === "open" ? "default" : "outline"
                        }>
                          {draw.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {userWin ? (
                          <Badge className="bg-success text-success-foreground">
                            Won ${Number(userWin.prize_amount).toLocaleString()}!
                          </Badge>
                        ) : draw.status === "completed" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <Empty
              icon={<Trophy className="h-10 w-10" />}
              title="No draws yet"
              description="Draws will appear here once they are created"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
