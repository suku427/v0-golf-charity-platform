import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty } from "@/components/ui/empty"
import Link from "next/link"
import { Plus, Target, TrendingDown, TrendingUp } from "lucide-react"

export const metadata = {
  title: "My Scores",
}

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get profile for rolling average
  const { data: profile } = await supabase
    .from("profiles")
    .select("rolling_average, score_count")
    .eq("id", user.id)
    .single()

  // Get all scores
  const { data: scores } = await supabase
    .from("golf_scores")
    .select("*")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })

  const rollingAverage = profile?.rolling_average ?? 0
  const scoreCount = profile?.score_count ?? 0

  // Calculate trend (compare last 5 to previous 5)
  let trend = 0
  if (scores && scores.length >= 10) {
    const recent = scores.slice(0, 5).reduce((sum, s) => sum + s.gross_score, 0) / 5
    const previous = scores.slice(5, 10).reduce((sum, s) => sum + s.gross_score, 0) / 5
    trend = previous - recent // positive = improving
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">My Scores</h1>
          <p className="mt-1 text-muted-foreground">
            Track your rounds and watch your game improve
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/scores/new">
            <Plus className="mr-2 h-4 w-4" />
            Log Round
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Rolling Average</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">
              {rollingAverage ? rollingAverage.toFixed(1) : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Last 5 rounds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              {trend >= 0 ? (
                <TrendingDown className="h-5 w-5 text-success" />
              ) : (
                <TrendingUp className="h-5 w-5 text-destructive" />
              )}
              <span className="text-sm font-medium text-muted-foreground">Trend</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">
              {trend !== 0 ? (
                <span className={trend >= 0 ? "text-success" : "text-destructive"}>
                  {trend >= 0 ? "-" : "+"}{Math.abs(trend).toFixed(1)}
                </span>
              ) : (
                "—"
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {trend >= 0 ? "Improving" : "Needs work"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Rounds</span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">{scoreCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">Lifetime logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
          <CardDescription>All your logged rounds</CardDescription>
        </CardHeader>
        <CardContent>
          {scores && scores.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Handicap Diff</TableHead>
                  <TableHead className="text-right">In Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((score, index) => (
                  <TableRow key={score.id}>
                    <TableCell>
                      {new Date(score.played_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{score.course_name}</TableCell>
                    <TableCell className="text-right font-serif text-lg font-bold">
                      {score.gross_score}
                    </TableCell>
                    <TableCell className="text-right">
                      {score.handicap_differential?.toFixed(1) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {index < 5 ? (
                        <Badge variant="default" className="bg-primary">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty
              icon={<Target className="h-10 w-10" />}
              title="No rounds logged"
              description="Start tracking your scores to build your rolling average"
              action={
                <Button asChild>
                  <Link href="/dashboard/scores/new">Log Your First Round</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
