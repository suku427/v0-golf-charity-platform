'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGolfScore(score: number) {
  if (score < 1 || score > 45) {
    throw new Error('Score must be between 1 and 45')
  }

  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  try {
    // Get all existing scores for this user
    const { data: existingScores } = await supabase
      .from('golf_scores')
      .select('id, score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Add the new score
    const { data: newScore, error: insertError } = await supabase
      .from('golf_scores')
      .insert({
        user_id: user.id,
        score: score,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) throw insertError

    // If we now have more than 5 scores, delete the oldest one
    if (existingScores && existingScores.length >= 5) {
      const oldestScore = existingScores[existingScores.length - 1]
      await supabase
        .from('golf_scores')
        .delete()
        .eq('id', oldestScore.id)
    }

    // Calculate rolling average
    const { data: allScores } = await supabase
      .from('golf_scores')
      .select('score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const rollingAverage = allScores && allScores.length > 0
      ? (allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length).toFixed(1)
      : null

    revalidatePath('/dashboard/scores')
    
    return {
      success: true,
      score: newScore,
      rollingAverage,
      totalScoresOnFile: (existingScores?.length ?? 0) + 1
    }
  } catch (error) {
    console.error('Error adding score:', error)
    throw error
  }
}

export async function getUserScores() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: scores } = await supabase
    .from('golf_scores')
    .select('id, score, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return scores || []
}

export async function getRollingAverage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get last 5 scores
  const { data: scores } = await supabase
    .from('golf_scores')
    .select('score')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!scores || scores.length === 0) {
    return null
  }

  const average = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  return parseFloat(average.toFixed(2))
}
