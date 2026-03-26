'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface DrawSimulation {
  totalParticipants: number
  totalPrizePool: number
  prizeBreakdown: {
    fiveMatch: { percentage: number; amount: number; winners: number }
    fourMatch: { percentage: number; amount: number; winners: number }
    threeMatch: { percentage: number; amount: number; winners: number }
  }
}

export async function simulateDraw(drawId: string): Promise<DrawSimulation> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if user is admin
  if (user.user_metadata?.role !== 'admin') {
    throw new Error('Admin access required')
  }

  try {
    // Get draw details
    const { data: draw } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

    if (!draw) throw new Error('Draw not found')

    // Get all active subscriptions for this draw period
    const { data: entries } = await supabase
      .from('draw_entries')
      .select('*')
      .eq('draw_id', drawId)
      .eq('status', 'active')

    if (!entries || entries.length === 0) {
      throw new Error('No active entries for this draw')
    }

    const totalParticipants = entries.length
    const totalPrizePool = totalParticipants * 100 // $100 per entry base

    return {
      totalParticipants,
      totalPrizePool,
      prizeBreakdown: {
        fiveMatch: {
          percentage: 40,
          amount: totalPrizePool * 0.4,
          winners: Math.ceil(totalParticipants * 0.05),
        },
        fourMatch: {
          percentage: 35,
          amount: totalPrizePool * 0.35,
          winners: Math.ceil(totalParticipants * 0.1),
        },
        threeMatch: {
          percentage: 25,
          amount: totalPrizePool * 0.25,
          winners: Math.ceil(totalParticipants * 0.15),
        },
      },
    }
  } catch (error) {
    console.error('Simulation error:', error)
    throw error
  }
}

export async function executeDraw(drawId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (user.user_metadata?.role !== 'admin') {
    throw new Error('Admin access required')
  }

  try {
    // Get active entries
    const { data: entries } = await supabase
      .from('draw_entries')
      .select('*')
      .eq('draw_id', drawId)
      .eq('status', 'active')

    if (!entries || entries.length === 0) {
      throw new Error('No entries to draw')
    }

    const totalPrizePool = entries.length * 100

    // Simulate drawing winners (5-match, 4-match, 3-match)
    const shuffled = entries.sort(() => Math.random() - 0.5)
    
    const fiveMatchCount = Math.ceil(entries.length * 0.05)
    const fourMatchCount = Math.ceil(entries.length * 0.1)
    const threeMatchCount = Math.ceil(entries.length * 0.15)

    const winners = [
      ...shuffled.slice(0, fiveMatchCount).map((e, i) => ({
        ...e,
        matchType: '5-match' as const,
        prizeAmount: (totalPrizePool * 0.4) / fiveMatchCount,
      })),
      ...shuffled.slice(fiveMatchCount, fiveMatchCount + fourMatchCount).map((e) => ({
        ...e,
        matchType: '4-match' as const,
        prizeAmount: (totalPrizePool * 0.35) / fourMatchCount,
      })),
      ...shuffled.slice(fiveMatchCount + fourMatchCount, fiveMatchCount + fourMatchCount + threeMatchCount).map((e) => ({
        ...e,
        matchType: '3-match' as const,
        prizeAmount: (totalPrizePool * 0.25) / threeMatchCount,
      })),
    ]

    // Insert winners into database
    for (const winner of winners) {
      await supabase.from('winners').insert({
        draw_id: drawId,
        user_id: winner.user_id,
        match_type: winner.matchType,
        prize_amount: winner.prizeAmount,
        status: 'pending_verification',
      })
    }

    // Update draw status
    await supabase
      .from('draws')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', drawId)

    revalidatePath('/admin/draws')

    return {
      success: true,
      winners: winners.length,
      totalPrizePool,
    }
  } catch (error) {
    console.error('Draw execution error:', error)
    throw error
  }
}

export async function getDraws() {
  const supabase = await createClient()

  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false })

  return draws || []
}

export async function getWinners(drawId: string) {
  const supabase = await createClient()

  const { data: winners } = await supabase
    .from('winners')
    .select('*, profiles(first_name, last_name, email)')
    .eq('draw_id', drawId)
    .order('prize_amount', { ascending: false })

  return winners || []
}

export async function approveWinner(winnerId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Admin access required')
  }

  const { error } = await supabase
    .from('winners')
    .update({ status: 'approved' })
    .eq('id', winnerId)

  if (error) throw error

  revalidatePath('/admin/winners')
  return { success: true }
}

export async function rejectWinner(winnerId: string, reason: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Admin access required')
  }

  const { error } = await supabase
    .from('winners')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', winnerId)

  if (error) throw error

  revalidatePath('/admin/winners')
  return { success: true }
}
