"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import { Plus, Trophy, Play } from "lucide-react"

type Draw = {
  id: string
  draw_date: string
  prize_pool: number
  charity_pool: number
  status: string
  created_at: string
}

export default function AdminDrawsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [runningDraw, setRunningDraw] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    drawDate: "",
    prizePool: "10000",
    charityPool: "5000",
  })

  const { data: draws, isLoading } = useSWR<Draw[]>("admin-draws", async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false })
    return data ?? []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCreateDraw = async () => {
    if (!formData.drawDate) {
      toast.error("Please select a draw date")
      return
    }

    setCreating(true)
    const supabase = createClient()

    const { error } = await supabase.from("draws").insert({
      draw_date: formData.drawDate,
      prize_pool: parseFloat(formData.prizePool),
      charity_pool: parseFloat(formData.charityPool),
      status: "open",
    })

    if (error) {
      toast.error("Failed to create draw", { description: error.message })
      setCreating(false)
      return
    }

    await mutate("admin-draws")
    toast.success("Draw created!")
    setCreateOpen(false)
    setCreating(false)
    setFormData({ drawDate: "", prizePool: "10000", charityPool: "5000" })
  }

  const handleRunDraw = async (drawId: string) => {
    setRunningDraw(drawId)
    const supabase = createClient()

    // Get all entries for this draw
    const { data: entries } = await supabase
      .from("draw_entries")
      .select("*, profiles(first_name, last_name)")
      .eq("draw_id", drawId)

    if (!entries || entries.length === 0) {
      toast.error("No entries for this draw")
      setRunningDraw(null)
      return
    }

    // Simple random selection - pick a winner
    const randomIndex = Math.floor(Math.random() * entries.length)
    const winner = entries[randomIndex]

    // Get draw details
    const { data: draw } = await supabase
      .from("draws")
      .select("prize_pool")
      .eq("id", drawId)
      .single()

    // Create winner record
    const { error: winnerError } = await supabase.from("winners").insert({
      draw_id: drawId,
      user_id: winner.user_id,
      prize_amount: draw?.prize_pool ?? 0,
      prize_type: "grand",
    })

    if (winnerError) {
      toast.error("Failed to record winner", { description: winnerError.message })
      setRunningDraw(null)
      return
    }

    // Update draw status
    await supabase
      .from("draws")
      .update({ status: "completed" })
      .eq("id", drawId)

    await mutate("admin-draws")
    toast.success(`Winner selected: ${winner.profiles?.first_name} ${winner.profiles?.last_name}!`)
    setRunningDraw(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Draws</h1>
          <p className="mt-1 text-muted-foreground">
            Manage monthly prize draws
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Draw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Draw</DialogTitle>
              <DialogDescription>Set up a new monthly prize draw</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="drawDate">Draw Date</FieldLabel>
                <Input
                  id="drawDate"
                  name="drawDate"
                  type="date"
                  value={formData.drawDate}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="prizePool">Prize Pool ($)</FieldLabel>
                <Input
                  id="prizePool"
                  name="prizePool"
                  type="number"
                  value={formData.prizePool}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="charityPool">Charity Pool ($)</FieldLabel>
                <Input
                  id="charityPool"
                  name="charityPool"
                  type="number"
                  value={formData.charityPool}
                  onChange={handleChange}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateDraw} disabled={creating}>
                {creating ? <Spinner className="mr-2" /> : null}
                {creating ? "Creating..." : "Create Draw"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Draws Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Draws</CardTitle>
          <CardDescription>Past and upcoming draws</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : draws && draws.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draw Date</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Charity Pool</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((draw) => (
                  <TableRow key={draw.id}>
                    <TableCell className="font-medium">
                      {new Date(draw.draw_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>${Number(draw.prize_pool).toLocaleString()}</TableCell>
                    <TableCell>${Number(draw.charity_pool).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        draw.status === "completed" ? "secondary" :
                        draw.status === "open" ? "default" : "outline"
                      }>
                        {draw.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {draw.status === "open" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRunDraw(draw.id)}
                          disabled={runningDraw === draw.id}
                        >
                          {runningDraw === draw.id ? (
                            <Spinner className="mr-2 h-4 w-4" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          Run Draw
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty
              icon={<Trophy className="h-10 w-10" />}
              title="No draws yet"
              description="Create your first draw to get started"
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Draw
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
