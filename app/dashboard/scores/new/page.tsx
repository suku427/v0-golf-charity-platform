"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewScorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    courseName: "",
    playedAt: new Date().toISOString().split("T")[0],
    grossScore: "",
    courseRating: "",
    slopeRating: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.courseName) newErrors.courseName = "Course name is required"
    if (!formData.playedAt) newErrors.playedAt = "Date is required"
    if (!formData.grossScore) newErrors.grossScore = "Score is required"
    const grossScore = parseInt(formData.grossScore)
    if (isNaN(grossScore) || grossScore < 50 || grossScore > 150) {
      newErrors.grossScore = "Enter a valid score (50-150)"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error("You must be logged in")
      setLoading(false)
      return
    }

    // Calculate handicap differential if course data provided
    let handicapDifferential = null
    const courseRating = parseFloat(formData.courseRating)
    const slopeRating = parseFloat(formData.slopeRating)
    if (!isNaN(courseRating) && !isNaN(slopeRating) && slopeRating > 0) {
      handicapDifferential = ((grossScore - courseRating) * 113) / slopeRating
    }

    const { error } = await supabase.from("golf_scores").insert({
      user_id: user.id,
      course_name: formData.courseName,
      played_at: formData.playedAt,
      gross_score: grossScore,
      course_rating: isNaN(courseRating) ? null : courseRating,
      slope_rating: isNaN(slopeRating) ? null : slopeRating,
      handicap_differential: handicapDifferential,
    })

    if (error) {
      setLoading(false)
      toast.error("Failed to save score", {
        description: error.message,
      })
      return
    }

    toast.success("Round logged successfully!")
    router.push("/dashboard/scores")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/scores">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scores
        </Link>
      </Button>

      <Card className="mx-auto max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Log a Round</CardTitle>
            <CardDescription>
              Add your latest round to track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="courseName">Course Name</FieldLabel>
                <Input
                  id="courseName"
                  name="courseName"
                  placeholder="Pebble Beach Golf Links"
                  value={formData.courseName}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.courseName && <FieldError>{errors.courseName}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="playedAt">Date Played</FieldLabel>
                <Input
                  id="playedAt"
                  name="playedAt"
                  type="date"
                  value={formData.playedAt}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.playedAt && <FieldError>{errors.playedAt}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="grossScore">Gross Score</FieldLabel>
                <Input
                  id="grossScore"
                  name="grossScore"
                  type="number"
                  placeholder="85"
                  min="50"
                  max="150"
                  value={formData.grossScore}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.grossScore && <FieldError>{errors.grossScore}</FieldError>}
              </Field>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <p className="mb-3 text-sm font-medium">Optional: Course Details</p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Add course rating and slope to calculate your handicap differential
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="courseRating">Course Rating</FieldLabel>
                    <Input
                      id="courseRating"
                      name="courseRating"
                      type="number"
                      step="0.1"
                      placeholder="72.5"
                      value={formData.courseRating}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="slopeRating">Slope Rating</FieldLabel>
                    <Input
                      id="slopeRating"
                      name="slopeRating"
                      type="number"
                      placeholder="135"
                      value={formData.slopeRating}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Field>
                </div>
              </div>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" type="button" className="flex-1" asChild>
              <Link href="/dashboard/scores">Cancel</Link>
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              {loading ? "Saving..." : "Save Round"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
