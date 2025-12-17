"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, Info, Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Power, Box, Fan, Recycle, ExternalLink, Tv, ArrowLeft, Calendar, Download } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { COMPONENT_LABELS, type SavedBuild, type PCComponent, type ComponentType } from "@/lib/types"

interface BuildDetailClientProps {
    build: SavedBuild
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

export default function BuildDetailClient({ build }: BuildDetailClientProps) {
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

    const totalWattage = Object.values(build.build).reduce((sum, component) => sum + (component?.wattage || 0), 0)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const handleExport = () => {
        const buildText = `PC Build: ${build.name}
==================

Total Cost: ₱${build.total_price.toLocaleString()}
Total Power Draw: ${totalWattage}W
Saved: ${formatDate(build.created_at)}

Overall Strategy:
${build.reasoning.overall}

Components:
${Object.entries(build.build)
                .map(
                    ([type, component]) =>
                        `
${COMPONENT_LABELS[type as ComponentType]}:
  ${component.name}
  ${component.specs}
  ₱${component.price.toLocaleString()}
  
  Reasoning: ${build.reasoning.componentExplanations[type] || "Selected for best value."}`,
                )
                .join("\n")}

${build.reasoning.tradeOffs ? `\nTrade-offs:\n${build.reasoning.tradeOffs}` : ""}

Note: Prices are based on current Philippine retailer listings and may vary.
`

        const blob = new Blob([buildText], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${build.name.toLowerCase().replace(/\s+/g, "-")}-build.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="mb-8">
                <Link href="/builds" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Builds
                </Link>
            </div>

            <div className="space-y-8">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold">{build.name}</h1>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Saved on {formatDate(build.created_at)}</span>
                    </div>
                    <p className="text-muted-foreground text-balance text-lg">{build.reasoning.overall}</p>
                </div>

                <Card className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="text-center space-y-1">
                            <div className="text-3xl font-bold text-primary">
                                <span className="peso-symbol">₱</span>
                                {build.total_price.toLocaleString()}
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
                    {build.reused_parts && build.reused_parts.length > 0 && (
                        <>
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Recycle className="w-4 h-4" />
                                    Reused from Existing Build
                                </h3>
                                {build.reused_parts.map((type) => (
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
                                                <div className="text-sm text-muted-foreground mt-1">Using existing {COMPONENT_LABELS[type].toLowerCase()}</div>
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

                    {/* Components Section */}
                    <div className="space-y-3">
                        {(Object.entries(build.build) as [ComponentType, PCComponent][]).map(([type, component]) => (
                            <div key={type} className="border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleComponent(type)}
                                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors text-left gap-3"
                                >
                                    {/* Left: Icon with label below on mobile */}
                                    <div className="flex flex-col items-center flex-shrink-0 w-14 sm:w-16">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-primary/10 flex items-center justify-center">
                                            {COMPONENT_ICONS[type]}
                                        </div>
                                        <Badge variant="outline" className="text-[10px] sm:text-xs font-semibold mt-1.5 px-1.5">
                                            {COMPONENT_LABELS[type]}
                                        </Badge>
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
                                                <span className="peso-symbol">₱</span>
                                                {component.price.toLocaleString()}
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
                                    <div className="p-3 sm:p-4 pt-0 border-t bg-muted/30 space-y-3">
                                        {/* Specs - visible only on mobile since hidden from card */}
                                        <div className="text-xs text-muted-foreground sm:hidden border-b border-border/50 pb-2">
                                            <span className="font-medium text-foreground">Specs:</span> {component.specs}
                                        </div>
                                        <div className="text-sm leading-relaxed">{build.reasoning.componentExplanations[type]}</div>
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

                    {build.reasoning.tradeOffs && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                    {"Trade-offs & Considerations"}
                                </h3>
                                <p className="text-sm leading-relaxed">{build.reasoning.tradeOffs}</p>
                            </div>
                        </>
                    )}

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Prices are based on Philippine retailer listings at the time of save and may have changed.</p>
                    </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button onClick={handleExport} variant="outline" className="gap-2 flex-1 bg-transparent">
                        <Download className="w-4 h-4" />
                        {"Export .txt"}
                    </Button>
                    <Button asChild className="gap-2 flex-1">
                        <Link href="/">Create New Build</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
