import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty } from "@/components/ui/empty"
import { Star, Trophy, DollarSign } from "lucide-react"

export const metadata = {
  title: "Winners | Admin",
}

export default async function AdminWinnersPage() {
  const supabase = await createClient()

  // Get all winners with user and draw info
  const { data: winners } = await supabase
    .from("winners")
    .select(`
      *,
      profiles(first_name, last_name),
      draws(draw_date, prize_pool)
    `)
    .order("created_at", { ascending: false })

  const totalPrizes = winners?.reduce((sum, w) => sum + Number(w.prize_amount), 0) ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Winners</h1>
        <p className="mt-1 text-muted-foreground">
          Prize draw winners history
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Winners</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">{winners?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Total Prizes Awarded</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-success">
              ${totalPrizes.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Avg Prize</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">
              ${winners?.length ? Math.round(totalPrizes / winners.length).toLocaleString() : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Winners Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Winners</CardTitle>
          <CardDescription>Prize draw winners and amounts</CardDescription>
        </CardHeader>
        <CardContent>
          {winners && winners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Winner</TableHead>
                  <TableHead>Draw Date</TableHead>
                  <TableHead>Prize Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Claimed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((winner) => (
                  <TableRow key={winner.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {winner.profiles?.first_name} {winner.profiles?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {winner.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {winner.draws?.draw_date 
                        ? new Date(winner.draws.draw_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        winner.prize_type === "grand" ? "default" :
                        winner.prize_type === "second" ? "secondary" : "outline"
                      } className={winner.prize_type === "grand" ? "bg-primary" : ""}>
                        {winner.prize_type === "grand" ? "Grand Prize" :
                         winner.prize_type === "second" ? "Second Place" :
                         winner.prize_type === "third" ? "Third Place" : winner.prize_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-serif text-lg font-bold text-success">
                        ${Number(winner.prize_amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {winner.claimed_at ? (
                        <Badge variant="secondary">
                          {new Date(winner.claimed_at).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty
              icon={<Star className="h-10 w-10" />}
              title="No winners yet"
              description="Winners will appear here after draws are completed"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
