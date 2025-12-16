"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gamepad2,
  Briefcase,
  Palette,
  type LucideIcon,
  Layers,
  Target,
  Gauge,
  Monitor,
  Zap,
  Cpu,
  Wrench,
} from "lucide-react"
import { COMPONENT_TYPES, type QuizAnswers } from "@/lib/types"

interface QuizFormProps {
  onComplete: (answers: QuizAnswers) => void
}

interface ChoiceCardProps {
  value: string
  label: string
  description: string
  icon: LucideIcon
  isSelected: boolean
  onClick: () => void
}

function ChoiceCard({ value, label, description, icon: Icon, isSelected, onClick }: ChoiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-6 rounded-lg border-2 transition-all duration-200 text-left
        hover:border-primary/50 hover:bg-primary/5
        card-hover btn-press
        ${isSelected ? "border-primary bg-primary/10" : "border-border bg-card"}
      `}
    >
      <div className="space-y-3">
        <div className={`inline-flex p-3 rounded-lg transition-all duration-200 ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
          <Icon className={`w-6 h-6 transition-all duration-200 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <div className="font-semibold text-lg mb-1">{label}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{description}</div>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-3 right-3 animate-check-pop">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  )
}

export default function QuizForm({ onComplete }: QuizFormProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({
    budget: 50000,
    primaryUse: "gaming",
    performancePriority: "balanced",
    targetResolution: "1440p",
    refreshRateGoal: "144hz",
    brandPreferences: {
      cpu: "any",
      gpu: "any",
    },
    existingParts: [],
  })

  const updateAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1)
    } else {
      onComplete(answers)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What's Your Budget?</h2>
              <p className="text-muted-foreground text-balance">Set your maximum budget for the entire PC build</p>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  <span className="peso-symbol">₱</span>
                  {answers.budget.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Build Budget</p>
              </div>
              <Slider
                value={[answers.budget]}
                onValueChange={([value]) => updateAnswer("budget", value)}
                min={20000}
                max={300000}
                step={10000}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  <span className="peso-symbol">₱</span>20,000
                </span>
                <span>
                  <span className="peso-symbol">₱</span>300,000
                </span>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Primary Use Case</h2>
              <p className="text-muted-foreground text-balance">How will you primarily use this PC?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ChoiceCard
                value="gaming"
                label="Gaming"
                description="Play the latest games at high settings"
                icon={Gamepad2}
                isSelected={answers.primaryUse === "gaming"}
                onClick={() => updateAnswer("primaryUse", "gaming")}
              />
              <ChoiceCard
                value="productivity"
                label="Productivity"
                description="Office work, browsing, general computing"
                icon={Briefcase}
                isSelected={answers.primaryUse === "productivity"}
                onClick={() => updateAnswer("primaryUse", "productivity")}
              />
              <ChoiceCard
                value="content-creation"
                label="Content Creation"
                description="Video editing, 3D rendering, design work"
                icon={Palette}
                isSelected={answers.primaryUse === "content-creation"}
                onClick={() => updateAnswer("primaryUse", "content-creation")}
              />
              <ChoiceCard
                value="mixed"
                label="Mixed Use"
                description="Combination of gaming and work"
                icon={Layers}
                isSelected={answers.primaryUse === "mixed"}
                onClick={() => updateAnswer("primaryUse", "mixed")}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Performance Priority</h2>
              <p className="text-muted-foreground text-balance">What matters most for your build?</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ChoiceCard
                value="max-performance"
                label="Maximum Performance"
                description="Best components regardless of price efficiency"
                icon={Zap}
                isSelected={answers.performancePriority === "max-performance"}
                onClick={() => updateAnswer("performancePriority", "max-performance")}
              />
              <ChoiceCard
                value="balanced"
                label="Balanced Build"
                description="Optimal performance per dollar"
                icon={Target}
                isSelected={answers.performancePriority === "balanced"}
                onClick={() => updateAnswer("performancePriority", "balanced")}
              />
              <ChoiceCard
                value="value"
                label="Best Value"
                description="Maximize performance within budget"
                icon={Gauge}
                isSelected={answers.performancePriority === "value"}
                onClick={() => updateAnswer("performancePriority", "value")}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Display Preferences</h2>
              <p className="text-muted-foreground text-balance">What resolution and refresh rate are you targeting?</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Target Resolution</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "1080p", label: "1080p" },
                    { value: "1440p", label: "1440p" },
                    { value: "4k", label: "4K" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateAnswer("targetResolution", option.value as any)}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 font-semibold
                        hover:border-primary/50 hover:bg-primary/5
                        ${answers.targetResolution === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                        }
                      `}
                    >
                      <Monitor className="w-5 h-5 mx-auto mb-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Refresh Rate Goal</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "60hz", label: "60Hz" },
                    { value: "144hz", label: "144Hz" },
                    { value: "240hz+", label: "240Hz+" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateAnswer("refreshRateGoal", option.value as any)}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 font-semibold
                        hover:border-primary/50 hover:bg-primary/5
                        ${answers.refreshRateGoal === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                        }
                      `}
                    >
                      <Zap className="w-5 h-5 mx-auto mb-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Brand Preferences</h2>
              <p className="text-muted-foreground text-balance">
                Do you have any brand preferences for key components?
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">CPU Brand</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "any", label: "No Preference" },
                    { value: "intel", label: "Intel" },
                    { value: "amd", label: "AMD" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateAnswer("brandPreferences", { ...answers.brandPreferences, cpu: option.value as any })
                      }
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 font-semibold
                        hover:border-primary/50 hover:bg-primary/5
                        ${answers.brandPreferences.cpu === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                        }
                      `}
                    >
                      <Cpu className="w-5 h-5 mx-auto mb-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">GPU Brand</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "any", label: "No Preference" },
                    { value: "nvidia", label: "NVIDIA" },
                    { value: "amd", label: "AMD" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateAnswer("brandPreferences", { ...answers.brandPreferences, gpu: option.value as any })
                      }
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 font-semibold
                        hover:border-primary/50 hover:bg-primary/5
                        ${answers.brandPreferences.gpu === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                        }
                      `}
                    >
                      <Monitor className="w-5 h-5 mx-auto mb-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Existing Parts</h2>
              <p className="text-muted-foreground text-balance">
                Do you already have any components you want to reuse?
              </p>
            </div>
            <div className="space-y-3">
              {COMPONENT_TYPES.map((component) => (
                <Label
                  key={component.value}
                  className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <Checkbox
                    checked={answers.existingParts.includes(component.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateAnswer("existingParts", [...answers.existingParts, component.value])
                      } else {
                        updateAnswer(
                          "existingParts",
                          answers.existingParts.filter((p) => p !== component.value),
                        )
                      }
                    }}
                  />
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{component.label}</span>
                </Label>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Your Preferences</h2>
              <p className="text-muted-foreground text-balance">
                Confirm your selections before we generate your personalized PC build
              </p>
            </div>
            <Card className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-semibold">
                  <span className="peso-symbol">₱</span>
                  {answers.budget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Primary Use</span>
                <span className="font-semibold capitalize">{answers.primaryUse.replace("-", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Performance Priority</span>
                <span className="font-semibold capitalize">{answers.performancePriority.replace("-", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Display</span>
                <span className="font-semibold">
                  {answers.targetResolution.toUpperCase()} @ {answers.refreshRateGoal.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPU Brand</span>
                <span className="font-semibold capitalize">{answers.brandPreferences.cpu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GPU Brand</span>
                <span className="font-semibold capitalize">{answers.brandPreferences.gpu}</span>
              </div>
              {answers.existingParts.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Existing Parts</span>
                  <span className="font-semibold">{answers.existingParts.length}</span>
                </div>
              )}
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of 7</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / 7) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-8">{renderStep()}</Card>

      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={handleBack} disabled={step === 0} className="gap-2 bg-transparent">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleNext} className="gap-2">
          {step === 6 ? (
            <>
              <Sparkles className="w-4 h-4" />
              Generate My Build
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
