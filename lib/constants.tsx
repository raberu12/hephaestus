import { Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Power, Box, Fan, Tv } from "lucide-react"
import type { ComponentType } from "@/lib/types"

/**
 * Icons for each component type
 * Shared across build-result.tsx and build-detail-client.tsx
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
 * Smaller icons for mobile views
 */
export const COMPONENT_ICONS_SMALL: Record<ComponentType, React.ReactNode> = {
    cpu: <Cpu className="w-5 h-5 text-primary" />,
    gpu: <Monitor className="w-5 h-5 text-primary" />,
    motherboard: <CircuitBoard className="w-5 h-5 text-primary" />,
    ram: <MemoryStick className="w-5 h-5 text-primary" />,
    storage: <HardDrive className="w-5 h-5 text-primary" />,
    psu: <Power className="w-5 h-5 text-primary" />,
    case: <Box className="w-5 h-5 text-primary" />,
    cooler: <Fan className="w-5 h-5 text-primary" />,
    monitor: <Tv className="w-5 h-5 text-primary" />,
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
