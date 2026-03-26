import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty } from "@/components/ui/empty"
import { Users } from "lucide-react"

export const metadata = {
  title: "Users | Admin",
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get all users with subscriptions
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      subscriptions(*, subscription_plans(*)),
      charities(name)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Manage platform users and subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="mt-1 font-serif text-3xl font-bold">{users?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active Subs</p>
            <p className="mt-1 font-serif text-3xl font-bold text-success">
              {users?.filter(u => u.subscriptions?.some((s: { status: string }) => s.status === "active")).length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">With Charity</p>
            <p className="mt-1 font-serif text-3xl font-bold text-secondary">
              {users?.filter(u => u.selected_charity_id).length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Avg Handicap</p>
            <p className="mt-1 font-serif text-3xl font-bold">
              {users?.length 
                ? (users.filter(u => u.handicap_index).reduce((sum, u) => sum + (u.handicap_index ?? 0), 0) / 
                   users.filter(u => u.handicap_index).length || 0).toFixed(1)
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Platform members and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Charity</TableHead>
                  <TableHead className="text-right">Rolling Avg</TableHead>
                  <TableHead className="text-right">Rounds</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const activeSub = user.subscriptions?.find((s: { status: string }) => s.status === "active")
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">{user.id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {activeSub ? (
                          <Badge variant="default" className="bg-success">
                            {activeSub.subscription_plans?.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.charities?.name ? (
                          <span className="text-sm">{user.charities.name}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {user.rolling_average?.toFixed(1) ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.score_count ?? 0}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <Empty
              icon={<Users className="h-10 w-10" />}
              title="No users yet"
              description="Users will appear here when they sign up"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
