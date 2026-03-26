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
    grossScore: "",
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
    const score = parseInt(formData.grossScore)
    if (!formData.grossScore) {
      newErrors.grossScore = "Score is required"
    } else if (isNaN(score) || score < 1 || score > 45) {
      newErrors.grossScore = "Score must be between 1 and 45"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const { addGolfScore } = await import("@/app/actions/scores")
      const result = await addGolfScore(score)

      toast.success(`Score logged! Rolling average: ${result.rollingAverage}`, {
        description: `Total scores on file: ${result.totalScoresOnFile}`,
      })
      router.push("/dashboard/scores")
      router.refresh()
    } catch (error) {
      setLoading(false)
      toast.error("Failed to save score", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
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
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong>Rolling Score Logic:</strong> Enter scores 1-45. Your 5 most recent count toward your rolling average. When you add a 6th score, the oldest automatically rolls out.
              </p>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="grossScore">Enter Your Score (1-45)</FieldLabel>
                <Input
                  id="grossScore"
                  name="grossScore"
                  type="number"
                  placeholder="Enter score"
                  min="1"
                  max="45"
                  value={formData.grossScore}
                  onChange={handleChange}
                  disabled={loading}
                  autoFocus
                  className="text-center text-2xl"
                />
                {errors.grossScore && <FieldError>{errors.grossScore}</FieldError>}
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" type="button" className="flex-1" asChild>
              <Link href="/dashboard/scores">Cancel</Link>
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              {loading ? "Logging..." : "Log Score"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
