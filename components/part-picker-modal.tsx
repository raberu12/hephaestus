"use client"

import { useState, useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ArrowUpDown, Check, Loader2 } from "lucide-react"
import { type ComponentType, type PCComponent, COMPONENT_LABELS } from "@/lib/types"

interface PartPickerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    componentType: ComponentType
    currentComponent: PCComponent | null
    onSelect: (component: PCComponent) => void
    availableComponents: PCComponent[]
    isLoading?: boolean
}

export default function PartPickerModal({
    open,
    onOpenChange,
    componentType,
    currentComponent,
    onSelect,
    availableComponents,
    isLoading = false,
}: PartPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"price" | "name">("price")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    // Filter and sort components
    const filteredComponents = useMemo(() => {
        let result = availableComponents.filter((comp) =>
            comp.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

        result.sort((a, b) => {
            if (sortBy === "price") {
                return sortOrder === "asc" ? a.price - b.price : b.price - a.price
            }
            return sortOrder === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        })

        return result
    }, [availableComponents, searchQuery, sortBy, sortOrder])

    const toggleSort = () => {
        if (sortBy === "price") {
            if (sortOrder === "asc") {
                setSortOrder("desc")
            } else {
                setSortBy("name")
                setSortOrder("asc")
            }
        } else {
            if (sortOrder === "asc") {
                setSortOrder("desc")
            } else {
                setSortBy("price")
                setSortOrder("asc")
            }
        }
    }

    const handleSelect = (component: PCComponent) => {
        onSelect(component)
        onOpenChange(false)
        setSearchQuery("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Select {COMPONENT_LABELS[componentType]}</DialogTitle>
                    <DialogDescription>
                        Choose a different {COMPONENT_LABELS[componentType].toLowerCase()} for your build
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search and Sort */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search ${COMPONENT_LABELS[componentType]}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={toggleSort} title="Sort">
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Sort indicator */}
                    <div className="text-xs text-muted-foreground">
                        Sorted by {sortBy} ({sortOrder === "asc" ? "low to high" : "high to low"})
                    </div>

                    {/* Component List */}
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    Loading components...
                                </div>
                            ) : filteredComponents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {availableComponents.length === 0
                                        ? "No components available"
                                        : "No components found matching your search"
                                    }
                                </div>
                            ) : (
                                filteredComponents.map((component, idx) => {
                                    const isSelected = currentComponent?.name === component.name
                                    return (
                                        <button
                                            key={`${component.name}-${idx}`}
                                            onClick={() => handleSelect(component)}
                                            className={`w-full text-left p-3 rounded-lg border transition-colors ${isSelected
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm line-clamp-1">
                                                            {component.name}
                                                        </span>
                                                        {isSelected && (
                                                            <Badge variant="outline" className="text-xs shrink-0">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                        {component.specs}
                                                    </div>
                                                    {component.wattage > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            TDP: {component.wattage}W
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-bold text-primary">
                                                        ₱{component.price.toLocaleString()}
                                                    </div>
                                                    {currentComponent && component.price !== currentComponent.price && (
                                                        <div
                                                            className={`text-xs ${component.price > currentComponent.price
                                                                ? "text-red-500"
                                                                : "text-green-500"
                                                                }`}
                                                        >
                                                            {component.price > currentComponent.price ? "+" : ""}
                                                            ₱{(component.price - currentComponent.price).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
