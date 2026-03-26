"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { Heart, Search, Check, ExternalLink } from "lucide-react"
import useSWR, { mutate } from "swr"

type Charity = {
  id: string
  name: string
  description: string | null
  category: string | null
  website_url: string | null
  logo_url: string | null
  is_active: boolean
}

type Profile = {
  id: string
  selected_charity_id: string | null
  charities: Charity | null
}

export default function CharityPage() {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useSWR<Profile>("profile-charity", async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data } = await supabase
      .from("profiles")
      .select("id, selected_charity_id, charities(*)")
      .eq("id", user.id)
      .single()
    return data
  })

  // Fetch charities
  const { data: charities, isLoading: charitiesLoading } = useSWR<Charity[]>("charities", async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("charities")
      .select("*")
      .eq("is_active", true)
      .order("name")
    return data ?? []
  })

  // Set initial selection
  useEffect(() => {
    if (profile?.selected_charity_id) {
      setSelectedId(profile.selected_charity_id)
    }
  }, [profile])

  const filteredCharities = charities?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleSelect = async (charityId: string) => {
    setSelectedId(charityId)
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error("You must be logged in")
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ selected_charity_id: charityId })
      .eq("id", user.id)

    if (error) {
      toast.error("Failed to update charity", { description: error.message })
      setSaving(false)
      return
    }

    await mutate("profile-charity")
    toast.success("Charity updated!")
    setSaving(false)
  }

  const isLoading = profileLoading || charitiesLoading

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold">My Charity</h1>
        <p className="mt-1 text-muted-foreground">
          Choose where your subscription contributions go
        </p>
      </div>

      {/* Current Selection */}
      {profile?.charities && (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-secondary" />
              <CardTitle>Your Selected Charity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl font-semibold">{profile.charities.name}</p>
                {profile.charities.category && (
                  <Badge variant="secondary" className="mt-1">{profile.charities.category}</Badge>
                )}
                {profile.charities.description && (
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    {profile.charities.description}
                  </p>
                )}
              </div>
              {profile.charities.website_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={profile.charities.website_url} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search charities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Charity Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredCharities.length > 0 ? (
          filteredCharities.map((charity) => {
            const isSelected = selectedId === charity.id
            return (
              <Card 
                key={charity.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? "border-secondary ring-2 ring-secondary/20" 
                    : "hover:border-border/80"
                }`}
                onClick={() => handleSelect(charity.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{charity.name}</p>
                      {charity.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {charity.category}
                        </Badge>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                        {saving ? (
                          <Spinner className="h-3 w-3 text-secondary-foreground" />
                        ) : (
                          <Check className="h-4 w-4 text-secondary-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  {charity.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {charity.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No charities found</p>
          </div>
        )}
      </div>
    </div>
  )
}
