"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, Download, RotateCcw, Info, Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Power, Box, Fan, Recycle, ExternalLink, Tv } from "lucide-react"
import { useState } from "react"
import { COMPONENT_LABELS, type PCComponent, type ComponentType, type ComponentReasoning } from "@/lib/types"

interface BuildResultProps {
  build: Record<ComponentType, PCComponent>
  reusedParts: ComponentType[]
  reasoning: ComponentReasoning
  onReset: () => void
}

const COMPONENT_ICONS: Record<ComponentType, React.ReactNode> = {
  cpu: <Cpu className="w-6 h-6 text-primary" />,
  gpu: <Monitor className="w-6 h-6 text-primary" />,
  motherboard: <CircuitBoard className="w-6 h-6 text-primary" />,
  ram: <MemoryStick className="w-6 h-6 text-primary" />,
  storage: <HardDrive className="w-6 h-6 text-primary" />,
  psu: <Power className="w-6 h-6 text-primary" />,
  case: <Box className="w-6 h-6 text-primary" />,
  cooler: <Fan className="w-6 h-6 text-primary" />,
  monitor: <Tv className="w-6 h-6 text-primary" />,
}

export default function BuildResult({ build, reusedParts, reasoning, onReset }: BuildResultProps) {
  const [expandedComponents, setExpandedComponents] = useState<Set<ComponentType>>(new Set())

  const toggleComponent = (type: ComponentType) => {
    setExpandedComponents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  // Prices from live search are already in PHP (reused parts have no cost)
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

        {/* Reused Parts Section */}
        {reusedParts.length > 0 && (
          <>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Recycle className="w-4 h-4" />
                Reusing from Existing Build
              </h3>
              {reusedParts.map((type) => (
                <div key={type} className="border border-dashed rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      {COMPONENT_ICONS[type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {COMPONENT_LABELS[type]}
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                          Reusing
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Using your existing {COMPONENT_LABELS[type].toLowerCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600">₱0</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
          </>
        )}

        {/* New Components Section */}
        <div className="space-y-3">
          {(Object.entries(build) as [ComponentType, PCComponent][]).map(([type, component], index) => (
            <div key={type} className={`border rounded-lg overflow-hidden card-hover animate-slide-up stagger-${index + 1}`} style={{ opacity: 0 }}>
              <button
                onClick={() => toggleComponent(type)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {COMPONENT_ICONS[type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {COMPONENT_LABELS[type]}
                      </Badge>
                      <span className="font-bold">{component.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{component.specs}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      <span className="peso-symbol">₱</span>
                      {component.price.toLocaleString()}
                    </div>
                  </div>
                  {expandedComponents.has(type) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedComponents.has(type) && (
                <div className="p-4 pt-0 border-t bg-muted/30 space-y-4 animate-slide-down">
                  <div className="text-sm leading-relaxed">{reasoning.componentExplanations[type]}</div>
                  {component.links && component.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Shop:</span>
                      {component.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {link.store}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
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
