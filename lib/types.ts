// USD to PHP conversion rate (approximate)
// Disclaimer: Prices are estimates and may vary based on current exchange rates and local retailer pricing
export const USD_TO_PHP_RATE = 56

export type ComponentType = "cpu" | "gpu" | "motherboard" | "ram" | "storage" | "psu" | "case" | "cooler"

export interface PCComponent {
  id: string
  name: string
  type: ComponentType
  price: number // Price in USD, convert using USD_TO_PHP_RATE for PHP display
  specs: string
  wattage: number
  performance?: string
}

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

export interface ExtendedPCComponent extends PCComponent {
  brand: string
  socket?: string
  chipset?: string
  compatibility?: {
    cpuSockets?: string[]
    ramType?: string
    minResolution?: string
  }
}

export interface BuildRecommendation {
  components: Record<ComponentType, PCComponent>
  totalPrice: number
  totalWattage: number
  reasoning: {
    overall: string
    componentExplanations: Record<ComponentType, string>
  }
}

export const COMPONENTS_DB: Record<ComponentType, PCComponent[]> = {
  cpu: [
    {
      id: "cpu-1",
      name: "AMD Ryzen 9 7950X",
      type: "cpu",
      price: 549,
      specs: "16-Core, 32-Thread, 5.7GHz Boost",
      wattage: 170,
      performance: "High-End",
    },
    {
      id: "cpu-2",
      name: "Intel Core i9-14900K",
      type: "cpu",
      price: 589,
      specs: "24-Core, 32-Thread, 6.0GHz Boost",
      wattage: 253,
      performance: "High-End",
    },
    {
      id: "cpu-3",
      name: "AMD Ryzen 7 7800X3D",
      type: "cpu",
      price: 449,
      specs: "8-Core, 16-Thread, 5.0GHz Boost, 3D V-Cache",
      wattage: 120,
      performance: "Gaming",
    },
    {
      id: "cpu-4",
      name: "Intel Core i5-14600K",
      type: "cpu",
      price: 319,
      specs: "14-Core, 20-Thread, 5.3GHz Boost",
      wattage: 181,
      performance: "Mid-Range",
    },
  ],
  gpu: [
    {
      id: "gpu-1",
      name: "NVIDIA RTX 4090",
      type: "gpu",
      price: 1599,
      specs: "24GB GDDR6X, 2.52GHz Boost",
      wattage: 450,
      performance: "Ultra",
    },
    {
      id: "gpu-2",
      name: "NVIDIA RTX 4080",
      type: "gpu",
      price: 1199,
      specs: "16GB GDDR6X, 2.51GHz Boost",
      wattage: 320,
      performance: "High-End",
    },
    {
      id: "gpu-3",
      name: "AMD Radeon RX 7900 XTX",
      type: "gpu",
      price: 999,
      specs: "24GB GDDR6, 2.5GHz Boost",
      wattage: 355,
      performance: "High-End",
    },
    {
      id: "gpu-4",
      name: "NVIDIA RTX 4070",
      type: "gpu",
      price: 599,
      specs: "12GB GDDR6X, 2.48GHz Boost",
      wattage: 200,
      performance: "Mid-Range",
    },
  ],
  motherboard: [
    {
      id: "mb-1",
      name: "ASUS ROG Crosshair X670E Hero",
      type: "motherboard",
      price: 699,
      specs: "AMD X670E, PCIe 5.0, DDR5",
      wattage: 80,
      performance: "Premium",
    },
    {
      id: "mb-2",
      name: "MSI MAG B650 Tomahawk",
      type: "motherboard",
      price: 249,
      specs: "AMD B650, PCIe 4.0, DDR5",
      wattage: 60,
      performance: "Mid-Range",
    },
    {
      id: "mb-3",
      name: "ASUS ROG Maximus Z790 Hero",
      type: "motherboard",
      price: 629,
      specs: "Intel Z790, PCIe 5.0, DDR5",
      wattage: 80,
      performance: "Premium",
    },
  ],
  ram: [
    {
      id: "ram-1",
      name: "G.Skill Trident Z5 RGB",
      type: "ram",
      price: 359,
      specs: "64GB (2x32GB) DDR5-6000 CL30",
      wattage: 20,
      performance: "High-End",
    },
    {
      id: "ram-2",
      name: "Corsair Vengeance DDR5",
      type: "ram",
      price: 189,
      specs: "32GB (2x16GB) DDR5-5600 CL36",
      wattage: 15,
      performance: "Mid-Range",
    },
    {
      id: "ram-3",
      name: "Kingston Fury Beast",
      type: "ram",
      price: 89,
      specs: "16GB (2x8GB) DDR5-5200 CL40",
      wattage: 10,
      performance: "Budget",
    },
  ],
  storage: [
    {
      id: "storage-1",
      name: "Samsung 990 Pro",
      type: "storage",
      price: 449,
      specs: "4TB NVMe Gen4, 7450MB/s Read",
      wattage: 7,
      performance: "Premium",
    },
    {
      id: "storage-2",
      name: "WD Black SN850X",
      type: "storage",
      price: 229,
      specs: "2TB NVMe Gen4, 7300MB/s Read",
      wattage: 6,
      performance: "High-End",
    },
    {
      id: "storage-3",
      name: "Crucial P3 Plus",
      type: "storage",
      price: 89,
      specs: "1TB NVMe Gen4, 5000MB/s Read",
      wattage: 5,
      performance: "Budget",
    },
  ],
  psu: [
    {
      id: "psu-1",
      name: "Corsair HX1000i",
      type: "psu",
      price: 299,
      specs: "1000W 80+ Platinum, Fully Modular",
      wattage: 1000,
      performance: "Premium",
    },
    {
      id: "psu-2",
      name: "EVGA SuperNOVA 850 G6",
      type: "psu",
      price: 169,
      specs: "850W 80+ Gold, Fully Modular",
      wattage: 850,
      performance: "High-End",
    },
    {
      id: "psu-3",
      name: "Thermaltake Toughpower GF1",
      type: "psu",
      price: 109,
      specs: "650W 80+ Gold, Fully Modular",
      wattage: 650,
      performance: "Mid-Range",
    },
  ],
  case: [
    {
      id: "case-1",
      name: "Lian Li O11 Dynamic EVO",
      type: "case",
      price: 189,
      specs: "Mid Tower, Tempered Glass, E-ATX",
      wattage: 0,
      performance: "Premium",
    },
    {
      id: "case-2",
      name: "Fractal Design Torrent",
      type: "case",
      price: 199,
      specs: "Mid Tower, High Airflow, ATX",
      wattage: 0,
      performance: "High-End",
    },
    {
      id: "case-3",
      name: "NZXT H510 Flow",
      type: "case",
      price: 99,
      specs: "Mid Tower, Mesh Front, ATX",
      wattage: 0,
      performance: "Budget",
    },
  ],
  cooler: [
    {
      id: "cooler-1",
      name: "NZXT Kraken Z73 RGB",
      type: "cooler",
      price: 279,
      specs: "360mm AIO, LCD Display, RGB",
      wattage: 15,
      performance: "Premium",
    },
    {
      id: "cooler-2",
      name: "Arctic Liquid Freezer II 280",
      type: "cooler",
      price: 109,
      specs: "280mm AIO, High Performance",
      wattage: 12,
      performance: "High-End",
    },
    {
      id: "cooler-3",
      name: "Noctua NH-D15",
      type: "cooler",
      price: 109,
      specs: "Dual Tower, Air Cooler, 140mm Fans",
      wattage: 8,
      performance: "Premium Air",
    },
  ],
}
