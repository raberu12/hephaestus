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
 * Icons for each component type (Pre-styled for build results)
 * @deprecated Use COMPONENT_ICON_MAP instead for better flexibility
 */
export const COMPONENT_ICONS: Record<ComponentType, React.ReactNode> = {
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
