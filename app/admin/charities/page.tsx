"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import { Plus, Heart, ExternalLink } from "lucide-react"

type Charity = {
  id: string
  name: string
  description: string | null
  category: string | null
  website_url: string | null
  is_active: boolean
  created_at: string
}

export default function AdminCharitiesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    websiteUrl: "",
  })

  const { data: charities, isLoading } = useSWR<Charity[]>("admin-charities", async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("charities")
      .select("*")
      .order("name")
    return data ?? []
  })

  // Get donation totals
  const { data: donations } = useSWR("admin-charity-donations", async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("charity_donations")
      .select("charity_id, amount")
    return data ?? []
  })

  const donationsByCharity = donations?.reduce((acc, d) => {
    acc[d.charity_id] = (acc[d.charity_id] ?? 0) + Number(d.amount)
    return acc
  }, {} as Record<string, number>) ?? {}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCreateCharity = async () => {
    if (!formData.name) {
      toast.error("Please enter a charity name")
      return
    }

    setCreating(true)
    const supabase = createClient()

    const { error } = await supabase.from("charities").insert({
      name: formData.name,
      description: formData.description || null,
      category: formData.category || null,
      website_url: formData.websiteUrl || null,
      is_active: true,
    })

    if (error) {
      toast.error("Failed to create charity", { description: error.message })
      setCreating(false)
      return
    }

    await mutate("admin-charities")
    toast.success("Charity added!")
    setCreateOpen(false)
    setCreating(false)
    setFormData({ name: "", description: "", category: "", websiteUrl: "" })
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("charities")
      .update({ is_active: !isActive })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update charity")
      return
    }

    await mutate("admin-charities")
    toast.success(`Charity ${!isActive ? "activated" : "deactivated"}`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Charities</h1>
          <p className="mt-1 text-muted-foreground">
            Manage charity partners
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Charity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Charity</DialogTitle>
              <DialogDescription>Add a new charity partner</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Charity name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g. Youth Programs, Veterans, Healthcare"
                  value={formData.category}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://example.org"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the charity..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCharity} disabled={creating}>
                {creating ? <Spinner className="mr-2" /> : null}
                {creating ? "Adding..." : "Add Charity"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Charities</p>
            <p className="mt-1 font-serif text-3xl font-bold">{charities?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="mt-1 font-serif text-3xl font-bold text-success">
              {charities?.filter(c => c.is_active).length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Donated</p>
            <p className="mt-1 font-serif text-3xl font-bold text-secondary">
              ${Object.values(donationsByCharity).reduce((sum, v) => sum + v, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Charities</CardTitle>
          <CardDescription>Charity partners and donations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : charities && charities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Donations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charities.map((charity) => (
                  <TableRow key={charity.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{charity.name}</p>
                        {charity.description && (
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {charity.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {charity.category ? (
                        <Badge variant="outline">{charity.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {charity.website_url ? (
                        <a 
                          href={charity.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary hover:underline"
                        >
                          Visit <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(donationsByCharity[charity.id] ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={charity.is_active ? "default" : "secondary"}>
                        {charity.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleActive(charity.id, charity.is_active)}
                      >
                        {charity.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty
              icon={<Heart className="h-10 w-10" />}
              title="No charities yet"
              description="Add your first charity partner"
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charity
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
