import { Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Power, Box, Fan, Tv, type LucideIcon } from "lucide-react"
import type { ComponentType } from "@/lib/types"

/**
 * Icon mapping for component types
 * Returns the raw LucideIcon component to allow consumers to apply their own styling
 */
export const COMPONENT_ICON_MAP: Record<ComponentType, LucideIcon> = {
    cpu: Cpu,
    gpu: Monitor,
    motherboard: CircuitBoard,
    ram: MemoryStick,
    storage: HardDrive,
    psu: Power,
    case: Box,
    cooler: Fan,
    monitor: Tv,
}

/**
 * Format a date string for display
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions for customization
 */
export function formatDate(
    dateString: string,
    options?: Intl.DateTimeFormatOptions
): string {
    return new Date(dateString).toLocaleDateString("en-US", options ?? {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

/**
 * Format a date with full month name
 */
export function formatDateLong(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}
