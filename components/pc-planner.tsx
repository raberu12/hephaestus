"use client"

import { useState } from "react"
import QuizForm from "./quiz-form"
import BuildResult from "./build-result"
import Loader from "./loader"
import { toast } from "sonner"
import type { QuizAnswers, RecommendationResponse } from "@/lib/types"

type AppState = "quiz" | "loading" | "result"

const MAX_RETRIES = 3

export default function PCPlanner() {
  const [appState, setAppState] = useState<AppState>("quiz")
  const [retryCount, setRetryCount] = useState(0)
  const [recommendedBuild, setRecommendedBuild] = useState<RecommendationResponse | null>(null)

  const fetchRecommendation = async (answers: QuizAnswers, attempt: number = 1): Promise<RecommendationResponse> => {
    setRetryCount(attempt)

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        // Check if it's a retryable error (503, 429, etc.)
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Server error: ${response.status}`)
        }
        throw new Error(errorData.error || "Failed to generate recommendation")
      }

      return await response.json()
    } catch (error) {
      // Retry if we haven't exceeded max retries
      if (attempt < MAX_RETRIES) {
        // Wait before retrying (exponential backoff: 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
        return fetchRecommendation(answers, attempt + 1)
      }
      throw error
    }
  }

  const handleQuizComplete = async (answers: QuizAnswers) => {
    setAppState("loading")
    setRetryCount(1)

    try {
      const data = await fetchRecommendation(answers)
      setRecommendedBuild(data)
      setAppState("result")
    } catch (error) {
      console.error("Failed to generate build:", error)
      toast.error("Failed to generate build recommendation after multiple attempts. Please try again.")
      setAppState("quiz")
    } finally {
      setRetryCount(0)
    }
  }

  const handleReset = () => {
    setAppState("quiz")
    setRecommendedBuild(null)
    setRetryCount(0)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-[1400px]">
        <div className="mb-12 text-center space-y-3">
          <h1 className="text-4xl font-bold text-balance leading-tight heading-gradient">Forge Your Perfect Build</h1>
          <p className="text-muted-foreground text-lg text-pretty leading-relaxed max-w-2xl mx-auto">
            Answer a few questions and get a personalized PC build recommendation with AI-powered reasoning
          </p>
        </div>

        {appState === "quiz" && <QuizForm onComplete={handleQuizComplete} />}

        {appState === "loading" && <Loader retryCount={retryCount} maxRetries={MAX_RETRIES} />}

        {appState === "result" && recommendedBuild && (
          <BuildResult
            build={recommendedBuild.build}
            reusedParts={recommendedBuild.reusedParts || []}
            reasoning={recommendedBuild.reasoning}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}

