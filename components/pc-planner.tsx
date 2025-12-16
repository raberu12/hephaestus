"use client"

import { useState } from "react"
import QuizForm from "./quiz-form"
import BuildResult from "./build-result"
import Loader from "./loader"
import type { QuizAnswers, PCComponent, ComponentType } from "@/lib/types"

type AppState = "quiz" | "loading" | "result"

export default function PCPlanner() {
  const [appState, setAppState] = useState<AppState>("quiz")
  const [recommendedBuild, setRecommendedBuild] = useState<{
    build: Record<ComponentType, PCComponent>
    reasoning: any
  } | null>(null)

  const handleQuizComplete = async (answers: QuizAnswers) => {
    setAppState("loading")

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) throw new Error("Failed to generate recommendation")

      const data = await response.json()
      setRecommendedBuild(data)
      setAppState("result")
    } catch (error) {
      console.error("Failed to generate build:", error)
      alert("Failed to generate build recommendation. Please try again.")
      setAppState("quiz")
    }
  }

  const handleReset = () => {
    setAppState("quiz")
    setRecommendedBuild(null)
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

        {appState === "loading" && <Loader />}

        {appState === "result" && recommendedBuild && (
          <BuildResult build={recommendedBuild.build} reasoning={recommendedBuild.reasoning} onReset={handleReset} />
        )}
      </div>
    </div>
  )
}

