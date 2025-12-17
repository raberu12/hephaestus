"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Download, RotateCcw, Info, Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Power, Box, Fan, Recycle, ExternalLink, Tv, Save, Loader2, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { COMPONENT_LABELS, type PCComponent, type ComponentType, type ComponentReasoning, type BuildMetrics } from "@/lib/types"
import AuthModal from "./auth-modal"
import PartPickerModal from "./part-picker-modal"

interface BuildResultProps {
  build: Record<ComponentType, PCComponent>
  reusedParts: ComponentType[]
  reasoning: ComponentReasoning
  onReset: () => void
  metrics?: BuildMetrics
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

export default function BuildResult({ build: initialBuild, reusedParts, reasoning, onReset, metrics }: BuildResultProps) {
  const [expandedComponents, setExpandedComponents] = useState<Set<ComponentType>>(new Set())
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [buildName, setBuildName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Initialize build with placeholders for reused parts if missing
  const [currentBuild, setCurrentBuild] = useState(() => {
    const build = { ...initialBuild }
    reusedParts.forEach(type => {
      if (!build[type]) {
        build[type] = {
          id: `reused-${type}`,
          name: `Existing ${COMPONENT_LABELS[type]}`,
          type: type,
          price: 0,
          specs: "Specs unknown (Reuse)",
          wattage: 0,
        }
      }
    })
    return build
  })

  // Track which parts are owned (reused)
  const [ownedParts, setOwnedParts] = useState<Set<ComponentType>>(new Set(reusedParts))

  // Part picker state
  const [isPartPickerOpen, setIsPartPickerOpen] = useState(false)
  const [selectedComponentType, setSelectedComponentType] = useState<ComponentType | null>(null)
  const [availableComponents, setAvailableComponents] = useState<PCComponent[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState(false)
  const [swappedParts, setSwappedParts] = useState<Set<ComponentType>>(new Set())

  useEffect(() => {
    if (isPartPickerOpen && selectedComponentType) {
      setIsLoadingComponents(true)
      fetch(`/api/components?type=${selectedComponentType}&limit=500`)
        .then((res) => res.json())
        .then((data) => {
          // Handle both direct array and wrapped response formats
          if (data.components) {
            setAvailableComponents(data.components)
          } else if (data.data?.components) {
            setAvailableComponents(data.data.components)
          } else {
            setAvailableComponents([])
          }
        })
        .catch((err) => {
          console.error("Failed to fetch components:", err)
          toast.error("Failed to load components")
        })
        .finally(() => setIsLoadingComponents(false))
    }
  }, [isPartPickerOpen, selectedComponentType])

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

  const handleOpenPartPicker = (type: ComponentType) => {
    // Set loading immediately to show spinner from the start
    setIsLoadingComponents(true)
    setSelectedComponentType(type)
    setAvailableComponents([])
    setIsPartPickerOpen(true)
  }

  const handleSwapComponent = (newComponent: PCComponent) => {
    if (selectedComponentType) {
      setCurrentBuild((prev) => ({
        ...prev,
        [selectedComponentType]: newComponent,
      }))
      // Mark this component as manually swapped (to hide AI reasoning)
      setSwappedParts((prev) => new Set(prev).add(selectedComponentType))
      toast.success(`${COMPONENT_LABELS[selectedComponentType]} updated!`)
    }
  }

  const handleToggleOwned = (type: ComponentType) => {
    setOwnedParts((prev) => {
      const next = new Set(prev)
      prev.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  // Use currentBuild for display (supports swapping)
  const build = currentBuild

  // Prices from live search are already in PHP
  // Exclude owned parts from total price
  const totalPrice = Object.values(currentBuild).reduce((sum, component) => {
    if (ownedParts.has(component.type)) return sum
    return sum + (component?.price || 0)
  }, 0)

  // Calculate total wattage (excluding PSU capacity)
  const totalWattage = Object.values(build).reduce((sum, component) => {
    if (component.type === 'psu') return sum
    return sum + (component?.wattage || 0)
  }, 0)

  // Calculate dynamic PSU headroom based on current build
  const psuWattage = build.psu?.wattage || 0
  const currentHeadroom = psuWattage > 0
    ? Math.round(((psuWattage - totalWattage) / psuWattage) * 100)
    : 0

  const handleSaveClick = async () => {
    const supabase = createClient()

    if (!supabase) {
      toast.error("Authentication is not configured")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsSaveModalOpen(true)
  }

  const handleSaveBuild = async () => {
    if (!buildName.trim()) {
      toast.error("Please enter a name for your build")
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buildName.trim(),
          build,
          reusedParts,
          reasoning,
          totalPrice,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save build")
      }

      toast.success("Build saved successfully!")
      setIsSaveModalOpen(false)
      setBuildName("")
    } catch (error) {
      console.error("Error saving build:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save build")
    } finally {
      setIsSaving(false)
    }
  }

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
    <>
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">{"Your Personalized PC Build"}</h1>
          <p className="text-muted-foreground text-balance text-lg">{reasoning.overall}</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                <span className="peso-symbol">₱</span>
                {totalPrice.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{"Total Cost"}</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-bold">{totalWattage}W</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{"Power Draw"}</div>
            </div>
            {metrics?.estimatedFPS && metrics.estimatedFPS.high > 0 && (
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-green-500">
                  {metrics.estimatedFPS.low}-{metrics.estimatedFPS.high}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Est. FPS @ {metrics.targetResolution || '1080p'}
                </div>
              </div>
            )}
            {currentHeadroom > 0 ? (
              <div className="text-center space-y-1">
                <div className={`text-2xl sm:text-3xl font-bold ${currentHeadroom >= 20 ? 'text-green-500' :
                  currentHeadroom >= 10 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                  {currentHeadroom}%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{"PSU Headroom"}</div>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <div className="text-sm sm:text-base font-bold text-muted-foreground pt-1 sm:pt-2">
                  Not available
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                  Missing components
                  <br className="hidden sm:block" />
                  specs
                </div>
              </div>
            )}
          </div>

          <Separator />



          {/* New Components Section */}
          <div className="space-y-3">
            {(Object.entries(build) as [ComponentType, PCComponent][]).map(([type, component], index) => (
              <div key={type} className={`border rounded-lg overflow-hidden card-hover animate-slide-up stagger-${index + 1}`} style={{ opacity: 0 }}>
                <button
                  onClick={() => toggleComponent(type)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors text-left gap-3"
                >
                  {/* Left: Icon with label below on mobile */}
                  <div className="flex flex-col items-center flex-shrink-0 w-14 sm:w-16">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-primary/10 flex items-center justify-center">
                      {COMPONENT_ICONS[type]}
                    </div>
                    <div className="flex flex-col gap-1 items-center w-full">
                      <Badge variant="outline" className="text-[10px] sm:text-xs font-semibold px-1.5 w-full justify-center">
                        {COMPONENT_LABELS[type]}
                      </Badge>
                      {ownedParts.has(type) && (
                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20 px-1.5 w-full justify-center">
                          Owned
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Middle: Product name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base leading-tight line-clamp-2">
                      {component.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{component.specs}</div>
                  </div>

                  {/* Right: Price and expand */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-sm sm:text-lg whitespace-nowrap">
                        {ownedParts.has(type) ? (
                          <span className="flex items-center gap-2 justify-end">
                            <span className="line-through text-muted-foreground text-xs hidden sm:inline">₱{component.price.toLocaleString()}</span>
                            <span className="text-green-600">₱0</span>
                          </span>
                        ) : (
                          <span><span className="peso-symbol">₱</span>{component.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    {expandedComponents.has(type) ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {expandedComponents.has(type) && (
                  <div className="p-3 sm:p-4 pt-0 border-t bg-muted/30 space-y-3 animate-slide-down">
                    {/* Specs - visible only on mobile since hidden from card */}
                    <div className="text-xs text-muted-foreground sm:hidden border-b border-border/50 pb-2">
                      <span className="font-medium text-foreground">Specs:</span> {component.specs}
                    </div>

                    {/* Ownership Toggle */}
                    <div className="flex items-center gap-2 pb-2">
                      <input
                        type="checkbox"
                        id={`owned-${type}`}
                        checked={ownedParts.has(type)}
                        onChange={() => handleToggleOwned(type)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`owned-${type}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I already own this part
                      </label>
                    </div>
                    {/* AI Reasoning - hidden for manually swapped parts */}
                    {!swappedParts.has(type) && reasoning.componentExplanations[type] && (
                      <div className="text-sm leading-relaxed">{reasoning.componentExplanations[type]}</div>
                    )}
                    {swappedParts.has(type) && (
                      <div className="text-sm leading-relaxed text-muted-foreground italic">Manually selected</div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {component.links && component.links.length > 0 && (
                        <>
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
                          <span className="text-muted-foreground/50">•</span>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenPartPicker(type)
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                        Change
                      </Button>
                    </div>
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

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button onClick={handleSaveClick} className="gap-2 flex-1">
            <Save className="w-4 h-4" />
            {"Save Build"}
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2 flex-1 bg-transparent">
            <Download className="w-4 h-4" />
            {"Export .txt"}
          </Button>
          <Button onClick={onReset} variant="outline" className="gap-2 flex-1 bg-transparent">
            <RotateCcw className="w-4 h-4" />
            {"Start New Build"}
          </Button>
        </div>
      </div>

      {/* Save Build Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Your Build</DialogTitle>
            <DialogDescription>
              Give your build a name to save it to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="build-name">Build Name</Label>
            <Input
              id="build-name"
              placeholder="e.g., Gaming Rig 2024"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="mt-2"
              onKeyDown={(e) => e.key === "Enter" && handleSaveBuild()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBuild} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Build"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth Modal for unauthenticated users */}
      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onSuccess={() => setIsSaveModalOpen(true)}
      />

      {/* Part Picker Modal for component swapping */}
      {selectedComponentType && (
        <PartPickerModal
          open={isPartPickerOpen}
          onOpenChange={setIsPartPickerOpen}
          componentType={selectedComponentType}
          currentComponent={build[selectedComponentType] || null}
          onSelect={handleSwapComponent}
          availableComponents={availableComponents}
          isLoading={isLoadingComponents}
        />
      )}
    </>
  )
}
