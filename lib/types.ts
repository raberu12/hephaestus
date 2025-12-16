// ============================================
// Component Types
// ============================================

export type ComponentType = "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler" | "monitor"

// Shopping link for a component
export interface ShoppingLink {
  store: string
  url: string
}

// PC Component with all fields including shopping links
export interface PCComponent {
  id: string
  name: string
  type: ComponentType
  price: number // Price in PHP from live search
  specs: string
  wattage: number
  performance?: string
  links?: ShoppingLink[]
}

// ============================================
// Quiz Types
// ============================================

export interface QuizAnswers {
  budget: number
  primaryUse: "gaming" | "productivity" | "content-creation" | "mixed"
  performancePriority: "max-performance" | "balanced" | "value"
  targetResolution: "1080p" | "1440p" | "4k"
  refreshRateGoal: "60hz" | "144hz" | "240hz+"
  brandPreferences: {
    cpu: "any" | "intel" | "amd"
    gpu: "any" | "nvidia" | "amd"
  }
  existingParts: ComponentType[]
}

// ============================================
// Recommendation Types
// ============================================

export interface ComponentReasoning {
  overall: string
  componentExplanations: Record<string, string>
  tradeOffs?: string
}

export interface RecommendationResponse {
  build: Record<ComponentType, PCComponent>
  reusedParts: ComponentType[]
  reasoning: ComponentReasoning
}

// ============================================
// Shared Constants (DRY)
// ============================================

export const COMPONENT_TYPES: { value: ComponentType; label: string; minSpec?: string }[] = [
  { value: "cpu", label: "CPU (Processor)" },
  { value: "gpu", label: "GPU (Graphics Card)" },
  { value: "motherboard", label: "Motherboard" },
  { value: "ram", label: "RAM (Memory)", minSpec: "at least 16GB" },
  { value: "storage", label: "Storage (SSD)", minSpec: "at least 500GB" },
  { value: "psu", label: "PSU (Power Supply)" },
  { value: "case", label: "Case" },
  { value: "cooler", label: "CPU Cooler" },
  { value: "monitor", label: "Monitor" },
]

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  cpu: "CPU",
  gpu: "GPU",
  motherboard: "Motherboard",
  ram: "RAM",
  storage: "Storage",
  psu: "PSU",
  case: "Case",
  cooler: "Cooler",
  monitor: "Monitor",
}
