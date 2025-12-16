import { COMPONENTS_DB, type PCComponent, type QuizAnswers, type ComponentType } from "./types"

interface FilteredCatalog {
  cpu: PCComponent[]
  gpu: PCComponent[]
  motherboard: PCComponent[]
  ram: PCComponent[]
  storage: PCComponent[]
  psu: PCComponent[]
  case: PCComponent[]
  cooler: PCComponent[]
}

export function filterCompatibleParts(answers: QuizAnswers): FilteredCatalog {
  const filtered: FilteredCatalog = {
    cpu: [],
    gpu: [],
    motherboard: [],
    ram: [],
    storage: [],
    psu: [],
    case: [],
    cooler: [],
  }

  // Filter CPUs based on brand preference
  filtered.cpu = COMPONENTS_DB.cpu.filter((cpu) => {
    if (answers.brandPreferences.cpu === "intel") return cpu.name.toLowerCase().includes("intel")
    if (answers.brandPreferences.cpu === "amd") return cpu.name.toLowerCase().includes("amd")
    return true
  })

  // Filter GPUs based on brand preference and performance requirements
  filtered.gpu = COMPONENTS_DB.gpu.filter((gpu) => {
    const brandMatch =
      answers.brandPreferences.gpu === "any" ||
      (answers.brandPreferences.gpu === "nvidia" && gpu.name.toLowerCase().includes("rtx")) ||
      (answers.brandPreferences.gpu === "amd" && gpu.name.toLowerCase().includes("radeon"))

    // Filter by resolution requirements
    let performanceMatch = true
    if (answers.targetResolution === "4k") {
      performanceMatch = gpu.performance === "Ultra" || gpu.performance === "High-End"
    } else if (answers.targetResolution === "1440p") {
      performanceMatch = gpu.performance !== "Budget"
    }

    return brandMatch && performanceMatch
  })

  // Filter motherboards based on CPU brand (Intel vs AMD)
  filtered.motherboard = COMPONENTS_DB.motherboard.filter((mb) => {
    const selectedCpuBrand = filtered.cpu[0]?.name.toLowerCase().includes("intel") ? "intel" : "amd"
    if (selectedCpuBrand === "intel") return mb.specs.toLowerCase().includes("intel")
    return mb.specs.toLowerCase().includes("amd")
  })

  // Filter RAM based on performance priority
  filtered.ram = COMPONENTS_DB.ram.filter((ram) => {
    if (answers.performancePriority === "value") return ram.performance !== "High-End"
    if (answers.performancePriority === "max-performance") return ram.performance !== "Budget"
    return true
  })

  // Filter storage based on use case
  filtered.storage = COMPONENTS_DB.storage.filter((storage) => {
    if (answers.primaryUse === "content-creation") return storage.performance !== "Budget"
    return true
  })

  // All PSUs are compatible, but we'll calculate required wattage later
  filtered.psu = COMPONENTS_DB.psu

  // All cases are compatible
  filtered.case = COMPONENTS_DB.case.filter((c) => {
    if (answers.performancePriority === "value") return c.performance !== "Premium"
    return true
  })

  // All coolers are compatible
  filtered.cooler = COMPONENTS_DB.cooler.filter((cooler) => {
    if (answers.performancePriority === "value") return cooler.performance !== "Premium"
    return true
  })

  return filtered
}

export function calculateRequiredPSU(components: Partial<Record<ComponentType, PCComponent>>): number {
  let totalWattage = 0
  Object.values(components).forEach((component) => {
    if (component) totalWattage += component.wattage
  })
  // Add 20% headroom
  return Math.ceil(totalWattage * 1.2)
}
