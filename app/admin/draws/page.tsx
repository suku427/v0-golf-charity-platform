'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import { Play, Zap, TrendingUp } from "lucide-react"

type Draw = {
  id: string
  draw_date: string
  status: string
  created_at: string
}

interface DrawSimulation {
  totalParticipants: number
  totalPrizePool: number
  prizeBreakdown: {
    fiveMatch: { percentage: number; amount: number; winners: number }
    fourMatch: { percentage: number; amount: number; winners: number }
    threeMatch: { percentage: number; amount: number; winners: number }
  }
}

export default function AdminDrawsPage() {
  const [simulatingDraw, setSimulatingDraw] = useState<string | null>(null)
  const [simulation, setSimulation] = useState<DrawSimulation | null>(null)
  const [executingDraw, setExecutingDraw] = useState<string | null>(null)

  const { data: draws, isLoading } = useSWR<Draw[]>("admin-draws", async () => {
    const supabase = await (await import("@/lib/supabase/server")).createClient()
    const { data } = await supabase
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false })
    return data ?? []
  })

  const handleSimulate = async (drawId: string) => {
    setSimulatingDraw(drawId)
    try {
      const { simulateDraw } = await import("@/app/actions/draws")
      const result = await simulateDraw(drawId)
      setSimulation(result)
      toast.success("Draw simulation complete!")
    } catch (error) {
      toast.error("Simulation failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setSimulatingDraw(null)
    }
  }

  const handleExecute = async (drawId: string) => {
    if (!confirm("Are you sure? This will execute the draw and select winners.")) {
      return
    }

    setExecutingDraw(drawId)
    try {
      const { executeDraw } = await import("@/app/actions/draws")
      const result = await executeDraw(drawId)
      
      await mutate("admin-draws")
      setSimulation(null)
      
      toast.success(`Draw executed! ${result.winners} winners selected.`, {
        description: `Total prize pool: $${(result.totalPrizePool / 100).toFixed(2)}`
      })
    } catch (error) {
      toast.error("Execution failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setExecutingDraw(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-300'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-300'
      case 'completed': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Monthly Draws</h1>
        <p className="mt-1 text-muted-foreground">
          Simulate and execute monthly prize draws with prize pool distribution
        </p>
      </div>

      {/* Draws Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Draws</CardTitle>
          <CardDescription>Run simulations before executing draws</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading draws...</div>
          ) : draws && draws.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draw Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((draw) => (
                  <TableRow key={draw.id}>
                    <TableCell className="font-medium">
                      {formatDate(draw.draw_date)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${getStatusColor(draw.status)}`}>
                        {draw.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSimulate(draw.id)}
                            disabled={simulatingDraw === draw.id}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Simulate
                          </Button>
                        </DialogTrigger>
                        {simulation && (
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Draw Simulation - {formatDate(draw.draw_date)}</DialogTitle>
                              <DialogDescription>
                                Pre-execution analysis of prize distribution
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Overview */}
                              <div className="grid gap-4 sm:grid-cols-2">
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-sm text-muted-foreground">Total Participants</div>
                                    <div className="mt-2 font-serif text-3xl font-bold">
                                      {simulation.totalParticipants}
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-sm text-muted-foreground">Prize Pool</div>
                                    <div className="mt-2 font-serif text-3xl font-bold" style={{color: '#c89a4a'}}>
                                      ${(simulation.totalPrizePool / 100).toFixed(2)}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Prize Breakdown */}
                              <div className="space-y-3">
                                <h4 className="font-semibold">Prize Pool Distribution</h4>
                                
                                {/* 5-Match */}
                                <div className="p-4 rounded-lg border border-border/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">5-Match Winners</span>
                                    <Badge variant="secondary">40%</Badge>
                                  </div>
                                  <div className="text-2xl font-bold" style={{color: '#6cb568'}}>
                                    ${(simulation.prizeBreakdown.fiveMatch.amount / 100).toFixed(2)}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {simulation.prizeBreakdown.fiveMatch.winners} winners
                                  </p>
                                </div>

                                {/* 4-Match */}
                                <div className="p-4 rounded-lg border border-border/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">4-Match Winners</span>
                                    <Badge variant="secondary">35%</Badge>
                                  </div>
                                  <div className="text-2xl font-bold" style={{color: '#4a8a8a'}}>
                                    ${(simulation.prizeBreakdown.fourMatch.amount / 100).toFixed(2)}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {simulation.prizeBreakdown.fourMatch.winners} winners
                                  </p>
                                </div>

                                {/* 3-Match */}
                                <div className="p-4 rounded-lg border border-border/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">3-Match Winners</span>
                                    <Badge variant="secondary">25%</Badge>
                                  </div>
                                  <div className="text-2xl font-bold" style={{color: '#8a6a4a'}}>
                                    ${(simulation.prizeBreakdown.threeMatch.amount / 100).toFixed(2)}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {simulation.prizeBreakdown.threeMatch.winners} winners
                                  </p>
                                </div>
                              </div>

                              {/* Math Reference */}
                              <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground">
                                <p><strong>Prize Pool Math:</strong> $100 per participant × {simulation.totalParticipants} = ${(simulation.totalPrizePool / 100).toFixed(2)}</p>
                              </div>

                              <Button
                                className="w-full"
                                onClick={() => handleExecute(draw.id)}
                                disabled={executingDraw === draw.id}
                                style={{backgroundColor: '#6cb568', color: '#1a1a2e'}}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {executingDraw === draw.id ? 'Executing...' : 'Execute Draw'}
                              </Button>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No draws found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
