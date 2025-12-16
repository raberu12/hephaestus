"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, Download, RotateCcw, Info } from "lucide-react"
import { useState } from "react"
import type { PCComponent, ComponentType } from "@/lib/types"

interface BuildResultProps {
  build: Record<ComponentType, PCComponent>
  reasoning: {
    overall: string
    componentExplanations: Record<string, string>
    tradeOffs?: string
  }
  onReset: () => void
}

const COMPONENT_LABELS: Record<ComponentType, string> = {
  cpu: "CPU",
  gpu: "GPU",
  motherboard: "Motherboard",
  ram: "RAM",
  storage: "Storage",
  psu: "PSU",
  case: "Case",
  cooler: "Cooler",
}

export default function BuildResult({ build, reasoning, onReset }: BuildResultProps) {
  const [expandedComponent, setExpandedComponent] = useState<ComponentType | null>(null)

  // Prices from live search are already in PHP
  const totalPrice = Object.values(build).reduce((sum, component) => sum + (component?.price || 0), 0)
  const totalWattage = Object.values(build).reduce((sum, component) => sum + (component?.wattage || 0), 0)

  const handleExport = () => {
    const buildText = `PC Build Recommendation
==================

Total Cost: ₱${totalPrice.toLocaleString()}
Total Power Draw: ${totalWattage}W

Overall Strategy:
${reasoning.overall}

Components:
${Object.entries(build)
        .map(
          ([type, component]) =>
            `
${COMPONENT_LABELS[type as ComponentType]}:
  ${component.name}
  ${component.specs}
  ₱${component.price.toLocaleString()}
  
  Reasoning: ${reasoning.componentExplanations[type] || "Selected for best value."}`,
        )
        .join("\n")}

${reasoning.tradeOffs ? `\nTrade-offs:\n${reasoning.tradeOffs}` : ""}

Note: Prices are based on current Philippine retailer listings and may vary.
`

    const blob = new Blob([buildText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pc-build-recommendation.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">{"Your Personalized PC Build"}</h1>
        <p className="text-muted-foreground text-balance text-lg">{reasoning.overall}</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-primary">
              <span className="peso-symbol">₱</span>
              {totalPrice.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{"Total Cost"}</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold">{totalWattage}W</div>
            <div className="text-sm text-muted-foreground">{"Power Draw"}</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {(Object.entries(build) as [ComponentType, PCComponent][]).map(([type, component]) => (
            <div key={type} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedComponent(expandedComponent === type ? null : type)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {COMPONENT_LABELS[type]}
                    </Badge>
                    <span className="font-bold">{component.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{component.specs}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      <span className="peso-symbol">₱</span>
                      {component.price.toLocaleString()}
                    </div>
                  </div>
                  {expandedComponent === type ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedComponent === type && (
                <div className="p-4 pt-0 border-t bg-muted/30">
                  <div className="text-sm leading-relaxed">{reasoning.componentExplanations[type]}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {reasoning.tradeOffs && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {"Trade-offs & Considerations"}
              </h3>
              <p className="text-sm leading-relaxed">{reasoning.tradeOffs}</p>
            </div>
          </>
        )}

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Prices are based on current Philippine retailer listings and may vary. Always verify prices before purchasing.</p>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleExport} variant="outline" className="gap-2 flex-1 bg-transparent">
          <Download className="w-4 h-4" />
          {"Export Build Details"}
        </Button>
        <Button onClick={onReset} variant="outline" className="gap-2 flex-1 bg-transparent">
          <RotateCcw className="w-4 h-4" />
          {"Start New Build"}
        </Button>
      </div>
    </div>
  )
}
