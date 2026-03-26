'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Heart, Search, Check } from "lucide-react"
import useSWR, { mutate } from "swr"

type Charity = {
  id: string
  name: string
  description: string | null
  category: string | null
  website_url: string | null
  active: boolean
}

type UserCharity = {
  id: string
  charity_id: string
  contribution_percentage: number
}

export default function CharityPage() {
  const [search, setSearch] = useState("")
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null)
  const [contribution, setContribution] = useState(10)
  const [saving, setSaving] = useState(false)

  // Fetch charities
  const { data: charities, isLoading: charitiesLoading } = useSWR<Charity[]>("charities", async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("charities")
      .select("*")
      .eq("active", true)
      .order("name")
    return data ?? []
  })

  // Fetch user's current charity selection
  const { data: userCharities } = useSWR<UserCharity[]>("user-charities", async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data } = await supabase
      .from("user_charities")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
    return data
  })

  // Set initial selection from user data
  useEffect(() => {
    if (userCharities && userCharities.length > 0) {
      setSelectedCharityId(userCharities[0].charity_id)
      setContribution(userCharities[0].contribution_percentage || 10)
    }
  }, [userCharities])

  const filteredCharities = charities?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleSelect = async (charityId: string) => {
    if (contribution < 10) {
      toast.error("Minimum contribution is 10%")
      return
    }

    setSelectedCharityId(charityId)
    setSaving(true)

    try {
      const { selectCharity } = await import("@/app/actions/charity")
      await selectCharity(charityId, contribution)
      
      await mutate("user-charities")
      toast.success(`Selected with ${contribution}% contribution!`)
    } catch (error) {
      toast.error("Failed to select charity", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">Choose Your Charity Partner</h1>
        <p className="mt-1 text-muted-foreground">
          Select which organization you want to support with a minimum 10% contribution from your winnings.
        </p>
      </div>

      {/* Contribution Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Percentage</CardTitle>
          <CardDescription>
            Minimum 10% - Set how much of your winnings go to charity (adjustable anytime)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="range"
                min="10"
                max="100"
                value={contribution}
                onChange={(e) => setContribution(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="text-right min-w-16">
                <span className="font-serif text-2xl font-bold" style={{color: '#c89a4a'}}>
                  {contribution}%
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              With 10% contribution, your winnings are split: You keep 90%, charity gets 10%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search charities by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Charities Grid */}
      {charitiesLoading ? (
        <div className="text-center py-12">Loading charities...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredCharities.map((charity) => (
            <button
              key={charity.id}
              onClick={() => handleSelect(charity.id)}
              disabled={saving}
              className="text-left"
            >
              <Card
                className={`h-full transition-all cursor-pointer ${
                  selectedCharityId === charity.id ? 'ring-2' : ''
                }`}
                style={{
                  borderColor: selectedCharityId === charity.id ? '#c89a4a' : undefined,
                  ringColor: selectedCharityId === charity.id ? '#c89a4a' : undefined,
                }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{charity.name}</h3>
                      {charity.category && (
                        <Badge variant="secondary" className="mt-2">
                          {charity.category}
                        </Badge>
                      )}
                    </div>
                    {selectedCharityId === charity.id && (
                      <Check className="h-6 w-6" style={{color: '#6cb568'}} />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {charity.description || "Supporting positive impact"}
                  </p>

                  <Button
                    size="sm"
                    className="w-full"
                    style={selectedCharityId === charity.id ? {backgroundColor: '#c89a4a', color: '#1a1a2e'} : undefined}
                    disabled={saving}
                  >
                    {selectedCharityId === charity.id ? 'Selected' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {filteredCharities.length === 0 && !charitiesLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No charities found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
