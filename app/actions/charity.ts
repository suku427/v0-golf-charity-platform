'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function selectCharity(charityId: string, contributionPercentage: number) {
  // Enforce minimum 10% contribution
  if (contributionPercentage < 10) {
    throw new Error('Minimum contribution is 10%')
  }

  if (contributionPercentage > 100) {
    throw new Error('Contribution cannot exceed 100%')
  }

  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  try {
    // Check if user already has a charity selected
    const { data: existing } = await supabase
      .from('user_charities')
      .select('id')
      .eq('user_id', user.id)
      .eq('charity_id', charityId)
      .single()

    if (existing) {
      // Update existing selection
      const { error } = await supabase
        .from('user_charities')
        .update({
          contribution_percentage: contributionPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Insert new selection
      const { error } = await supabase
        .from('user_charities')
        .insert({
          user_id: user.id,
          charity_id: charityId,
          contribution_percentage: contributionPercentage,
        })

      if (error) throw error
    }

    revalidatePath('/dashboard/charity')
    
    return {
      success: true,
      message: `Selected with ${contributionPercentage}% contribution`,
    }
  } catch (error) {
    console.error('Error selecting charity:', error)
    throw error
  }
}

export async function getUserCharities() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userCharities } = await supabase
    .from('user_charities')
    .select('*, charities(id, name, description, image_url, category)')
    .eq('user_id', user.id)

  return userCharities || []
}

export async function getCharities() {
  const supabase = await createClient()
  
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  return charities || []
}
