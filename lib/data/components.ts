import { readFileSync } from 'fs'
import { join } from 'path'

// ============================================
// Constants
// ============================================

const USD_TO_PHP_RATE = 58
const DATA_DIR = join(process.cwd(), 'data', 'components')

// ============================================
// Raw Data Types (from JSON)
// ============================================

export interface RawCPU {
    name: string
    price: number | null
    core_count: number
    core_clock: number
    boost_clock: number | null
    microarchitecture: string
    tdp: number
    graphics: string | null
}

export interface RawGPU {
    name: string
    price: number | null
    chipset: string
    memory: number
    core_clock: number
    boost_clock: number | null
    color: string | null
    length: number | null
}

export interface RawMotherboard {
    name: string
    price: number | null
    socket: string
    form_factor: string
    max_memory: number
    memory_slots: number
    color: string | null
}

export interface RawRAM {
    name: string
    price: number | null
    speed: number[]
    modules: number[]
    price_per_gb: number | null
    color: string | null
    first_word_latency: number | null
    cas_latency: number | null
}

export interface RawStorage {
    name: string
    price: number | null
    capacity: number
    price_per_gb: number | null
    type: string
    cache: number | null
    form_factor: string
    interface: string
}

export interface RawPSU {
    name: string
    price: number | null
    type: string
    efficiency: string
    wattage: number
    modular: string
    color: string | null
}

export interface RawCase {
    name: string
    price: number | null
    type: string
    color: string | null
    side_panel: string | null
    external_volume: number | null
    internal_35_bays: number
}

export interface RawCooler {
    name: string
    price: number | null
    rpm: number[] | null
    noise_level: number[] | null
    color: string | null
    size: number | null
}

export interface RawMonitor {
    name: string
    price: number | null
    screen_size: number
    resolution: number[]
    refresh_rate: number
    response_time: number | null
    panel_type: string
    aspect_ratio: string
}

// ============================================
// Processed Types (with PHP prices)
// ============================================

export interface ProcessedComponent {
    name: string
    priceUSD: number
    pricePHP: number
    specs: string
    wattage: number
}

export interface ProcessedCPU extends ProcessedComponent {
    coreCount: number
    coreClock: number
    boostClock: number | null
    microarchitecture: string
    tdp: number
    hasIntegratedGraphics: boolean
    brand: 'intel' | 'amd'
}

export interface ProcessedGPU extends ProcessedComponent {
    chipset: string
    memory: number
    coreClock: number
    boostClock: number | null
    brand: 'nvidia' | 'amd' | 'intel'
    tier: number // 1-10 performance tier for FPS estimation
}

// ============================================
// Data Loading
// ============================================

function loadJSON<T>(filename: string): T[] {
    try {
        const filePath = join(DATA_DIR, filename)
        const data = readFileSync(filePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        console.error(`Failed to load ${filename}`)
        return []
    }
}

// ============================================
// GPU Tier Mapping (for FPS estimation)
// ============================================

const GPU_TIER_MAP: Record<string, number> = {
    // NVIDIA - Current Gen
    'GeForce RTX 5090': 10,
    'GeForce RTX 5080': 9,
    'GeForce RTX 5070 Ti': 8,
    'GeForce RTX 5070': 7,
    'GeForce RTX 5060 Ti': 6,
    'GeForce RTX 5060': 5,
    'GeForce RTX 5050': 4,
    // NVIDIA - Previous Gen
    'GeForce RTX 4090': 10,
    'GeForce RTX 4080 SUPER': 9,
    'GeForce RTX 4080': 9,
    'GeForce RTX 4070 Ti SUPER': 8,
    'GeForce RTX 4070 Ti': 8,
    'GeForce RTX 4070 SUPER': 7,
    'GeForce RTX 4070': 7,
    'GeForce RTX 4060 Ti': 6,
    'GeForce RTX 4060': 5,
    'GeForce RTX 3090 Ti': 9,
    'GeForce RTX 3090': 9,
    'GeForce RTX 3080 Ti': 8,
    'GeForce RTX 3080': 8,
    'GeForce RTX 3070 Ti': 7,
    'GeForce RTX 3070': 7,
    'GeForce RTX 3060 Ti': 6,
    'GeForce RTX 3060': 5,
    'GeForce RTX 3050': 4,
    // AMD - Current Gen
    'Radeon RX 9070 XT': 8,
    'Radeon RX 9070': 7,
    'Radeon RX 9060 XT': 6,
    // AMD - Previous Gen
    'Radeon RX 7900 XTX': 9,
    'Radeon RX 7900 XT': 8,
    'Radeon RX 7900 GRE': 7,
    'Radeon RX 7800 XT': 7,
    'Radeon RX 7700 XT': 6,
    'Radeon RX 7600 XT': 5,
    'Radeon RX 7600': 5,
    'Radeon RX 6950 XT': 8,
    'Radeon RX 6900 XT': 8,
    'Radeon RX 6800 XT': 7,
    'Radeon RX 6800': 7,
    'Radeon RX 6700 XT': 6,
    'Radeon RX 6600 XT': 5,
    'Radeon RX 6600': 4,
    // Intel
    'Arc B580': 5,
    'Arc B570': 4,
    'Arc A770': 5,
    'Arc A750': 4,
}

function getGPUTier(chipset: string): number {
    // Try exact match first
    if (GPU_TIER_MAP[chipset]) return GPU_TIER_MAP[chipset]

    // Try partial match
    for (const [key, tier] of Object.entries(GPU_TIER_MAP)) {
        if (chipset.includes(key) || key.includes(chipset)) return tier
    }

    return 3 // Default low tier for unknown
}

function getGPUBrand(chipset: string): 'nvidia' | 'amd' | 'intel' {
    if (chipset.includes('GeForce') || chipset.includes('RTX') || chipset.includes('GTX')) return 'nvidia'
    if (chipset.includes('Radeon') || chipset.includes('RX')) return 'amd'
    if (chipset.includes('Arc')) return 'intel'
    return 'nvidia' // Default
}

function getCPUBrand(name: string): 'intel' | 'amd' {
    if (name.toLowerCase().includes('amd') || name.toLowerCase().includes('ryzen') || name.toLowerCase().includes('threadripper')) return 'amd'
    return 'intel'
}

// ============================================
// Data Processing
// ============================================

export function loadCPUs(): ProcessedCPU[] {
    const raw = loadJSON<RawCPU>('cpu.json')

    return raw
        .filter(cpu => cpu.price !== null && cpu.price > 0)
        .map(cpu => ({
            name: cpu.name,
            priceUSD: cpu.price!,
            pricePHP: Math.round(cpu.price! * USD_TO_PHP_RATE),
            specs: `${cpu.core_count} cores, ${cpu.core_clock}GHz${cpu.boost_clock ? ` (${cpu.boost_clock}GHz boost)` : ''}, ${cpu.tdp}W TDP`,
            wattage: cpu.tdp,
            coreCount: cpu.core_count,
            coreClock: cpu.core_clock,
            boostClock: cpu.boost_clock,
            microarchitecture: cpu.microarchitecture,
            tdp: cpu.tdp,
            hasIntegratedGraphics: cpu.graphics !== null,
            brand: getCPUBrand(cpu.name),
        }))
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

export function loadGPUs(): ProcessedGPU[] {
    const raw = loadJSON<RawGPU>('video-card.json')

    return raw
        .filter(gpu => gpu.price !== null && gpu.price > 0)
        .map(gpu => ({
            name: gpu.name,
            priceUSD: gpu.price!,
            pricePHP: Math.round(gpu.price! * USD_TO_PHP_RATE),
            specs: `${gpu.chipset}, ${gpu.memory}GB${gpu.boost_clock ? `, ${gpu.boost_clock}MHz boost` : ''}`,
            wattage: estimateGPUWattage(gpu.chipset),
            chipset: gpu.chipset,
            memory: gpu.memory,
            coreClock: gpu.core_clock,
            boostClock: gpu.boost_clock,
            brand: getGPUBrand(gpu.chipset),
            tier: getGPUTier(gpu.chipset),
        }))
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

function estimateGPUWattage(chipset: string): number {
    // Rough TDP estimates based on chipset
    const wattageMap: Record<string, number> = {
        'RTX 5090': 575, 'RTX 5080': 360, 'RTX 5070 Ti': 300, 'RTX 5070': 250,
        'RTX 5060 Ti': 180, 'RTX 5060': 150, 'RTX 5050': 100,
        'RTX 4090': 450, 'RTX 4080': 320, 'RTX 4070 Ti': 285, 'RTX 4070': 200,
        'RTX 4060 Ti': 165, 'RTX 4060': 115,
        'RTX 3090': 350, 'RTX 3080': 320, 'RTX 3070': 220, 'RTX 3060': 170,
        'RX 9070 XT': 290, 'RX 9070': 220, 'RX 9060 XT': 180,
        'RX 7900 XTX': 355, 'RX 7900 XT': 315, 'RX 7800 XT': 263,
        'RX 7700 XT': 245, 'RX 7600': 165,
    }

    for (const [key, wattage] of Object.entries(wattageMap)) {
        if (chipset.includes(key)) return wattage
    }
    return 150 // Default
}

// ============================================
// Filtering Functions
// ============================================

export interface FilterOptions {
    maxBudgetPHP: number
    brandPreference?: 'any' | 'intel' | 'amd' | 'nvidia'
    requireIntegratedGraphics?: boolean
    limit?: number
}

export function filterCPUs(options: FilterOptions): ProcessedCPU[] {
    let cpus = loadCPUs()

    // Filter by budget (allow some headroom for other components)
    const cpuBudget = options.maxBudgetPHP * 0.25 // ~25% of budget for CPU
    cpus = cpus.filter(cpu => cpu.pricePHP <= cpuBudget)

    // Filter by brand
    if (options.brandPreference && options.brandPreference !== 'any') {
        cpus = cpus.filter(cpu => cpu.brand === options.brandPreference)
    }

    // Filter for APUs if needed
    if (options.requireIntegratedGraphics) {
        cpus = cpus.filter(cpu => cpu.hasIntegratedGraphics)
    }

    // Get top performers within budget (sort by price desc to get best)
    cpus.sort((a, b) => b.pricePHP - a.pricePHP)

    return cpus.slice(0, options.limit || 20)
}

export function filterGPUs(options: FilterOptions): ProcessedGPU[] {
    let gpus = loadGPUs()

    // Filter by budget (allow ~40% for GPU in gaming builds)
    const gpuBudget = options.maxBudgetPHP * 0.45
    gpus = gpus.filter(gpu => gpu.pricePHP <= gpuBudget)

    // Filter by brand
    if (options.brandPreference && options.brandPreference !== 'any') {
        gpus = gpus.filter(gpu => gpu.brand === options.brandPreference)
    }

    // Get top performers within budget
    gpus.sort((a, b) => b.tier - a.tier || b.pricePHP - a.pricePHP)

    return gpus.slice(0, options.limit || 20)
}

// ============================================
// FPS Estimation
// ============================================

export function estimateFPS(gpuTier: number, resolution: '1080p' | '1440p' | '4k'): { low: number; high: number } {
    // Base FPS for tier 5 GPU at 1080p
    const baseFPS = 90

    // Tier multiplier
    const tierMultiplier = 0.15 * gpuTier + 0.25

    // Resolution multiplier
    const resolutionMultiplier: Record<string, number> = {
        '1080p': 1.0,
        '1440p': 0.7,
        '4k': 0.4,
    }

    const estimatedFPS = baseFPS * tierMultiplier * resolutionMultiplier[resolution]

    return {
        low: Math.round(estimatedFPS * 0.85),
        high: Math.round(estimatedFPS * 1.15),
    }
}

// ============================================
// Component List Formatting (for AI prompt)
// ============================================

export function formatCPUsForPrompt(cpus: ProcessedCPU[]): string {
    return cpus.map(cpu =>
        `- ${cpu.name} | Price: ${cpu.pricePHP} | ${cpu.specs}`
    ).join('\n')
}

export function formatGPUsForPrompt(gpus: ProcessedGPU[]): string {
    return gpus.map(gpu =>
        `- ${gpu.name} | Price: ${gpu.pricePHP} | ${gpu.specs}`
    ).join('\n')
}

// ============================================
// Additional Component Loaders (for Part Picker)
// ============================================

export function loadMotherboards(): ProcessedComponent[] {
    const raw = loadJSON<RawMotherboard>('motherboard.json')

    return raw
        .filter(mb => mb.price !== null && mb.price > 0)
        .map(mb => ({
            name: mb.name,
            priceUSD: mb.price!,
            pricePHP: Math.round(mb.price! * USD_TO_PHP_RATE),
            specs: `${mb.socket}, ${mb.form_factor}, ${mb.memory_slots} slots, max ${mb.max_memory}GB`,
            wattage: 50, // Typical motherboard power
        }))
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

export function loadRAM(): ProcessedComponent[] {
    const raw = loadJSON<RawRAM>('memory.json')

    return raw
        .filter(ram => ram.price !== null && ram.price > 0 && ram.modules && ram.speed)
        .map(ram => {
            const totalGB = ram.modules ? ram.modules[0] * ram.modules[1] : 0
            const speed = ram.speed ? ram.speed[0] : 0
            return {
                name: ram.name,
                priceUSD: ram.price!,
                pricePHP: Math.round(ram.price! * USD_TO_PHP_RATE),
                specs: `${totalGB}GB (${ram.modules?.[0]}x${ram.modules?.[1]}GB), ${speed}MHz${ram.cas_latency ? `, CL${ram.cas_latency}` : ''}`,
                wattage: 5, // Typical RAM power
            }
        })
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

export function loadStorage(): ProcessedComponent[] {
    const raw = loadJSON<RawStorage>('internal-hard-drive.json')

    return raw
        .filter(s => s.price !== null && s.price > 0)
        .map(s => {
            const capacityGB = s.capacity
            const capacityStr = capacityGB >= 1000 ? `${(capacityGB / 1000).toFixed(1)}TB` : `${capacityGB}GB`
            return {
                name: s.name,
                priceUSD: s.price!,
                pricePHP: Math.round(s.price! * USD_TO_PHP_RATE),
                specs: `${capacityStr}, ${s.type}, ${s.form_factor}, ${s.interface}`,
                wattage: s.type === 'SSD' ? 5 : 10, // SSD vs HDD
            }
        })
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

export function loadPSUs(): ProcessedComponent[] {
    const raw = loadJSON<RawPSU>('power-supply.json')

    return raw
        .filter(psu => psu.price !== null && psu.price > 0)
        .map(psu => ({
            name: psu.name,
            priceUSD: psu.price!,
            pricePHP: Math.round(psu.price! * USD_TO_PHP_RATE),
            specs: `${psu.wattage}W, ${psu.efficiency || 'Standard'}, ${psu.modular || 'Non-Modular'}`,
            wattage: psu.wattage, // PSU wattage is its capacity
        }))
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

export function loadCases(): ProcessedComponent[] {
    const raw = loadJSON<RawCase>('case.json')

    return raw
        .filter(c => c.price !== null && c.price > 0)
        .map(c => ({
            name: c.name,
            priceUSD: c.price!,
            pricePHP: Math.round(c.price! * USD_TO_PHP_RATE),
            specs: `${c.type}${c.side_panel ? `, ${c.side_panel}` : ''}${c.color ? `, ${c.color}` : ''}`,
            wattage: 0, // Case has no power draw
        }))
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

export function loadCoolers(): ProcessedComponent[] {
    const raw = loadJSON<RawCooler>('cpu-cooler.json')

    return raw
        .filter(c => c.price !== null && c.price > 0)
        .map(c => {
            const rpmStr = c.rpm ? `${c.rpm[0]}-${c.rpm[1]} RPM` : ''
            const noiseStr = c.noise_level ? `${c.noise_level[0]}-${c.noise_level[1]} dB` : ''
            return {
                name: c.name,
                priceUSD: c.price!,
                pricePHP: Math.round(c.price! * USD_TO_PHP_RATE),
                specs: [rpmStr, noiseStr, c.color].filter(Boolean).join(', ') || 'CPU Cooler',
                wattage: 10, // Typical cooler power
            }
        })
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

export function loadMonitors(): ProcessedComponent[] {
    const raw = loadJSON<RawMonitor>('monitor.json')

    return raw
        .filter(m => m.price !== null && m.price > 0)
        .map(m => {
            const res = m.resolution ? `${m.resolution[0]}x${m.resolution[1]}` : ''
            return {
                name: m.name,
                priceUSD: m.price!,
                pricePHP: Math.round(m.price! * USD_TO_PHP_RATE),
                specs: `${m.screen_size}", ${res}, ${m.refresh_rate}Hz, ${m.panel_type}`,
                wattage: 30, // Typical monitor power
            }
        })
        .sort((a, b) => a.pricePHP - b.pricePHP)
}

// ============================================
// Unified Component Getter (for Part Picker API)
// ============================================

import type { ComponentType } from '@/lib/types'

export interface PartPickerComponent {
    name: string
    price: number  // PHP
    specs: string
    wattage: number
}

export function getComponentsByType(
    type: ComponentType,
    options?: { limit?: number; search?: string }
): PartPickerComponent[] {
    let components: ProcessedComponent[]

    switch (type) {
        case 'cpu':
            components = loadCPUs()
            break
        case 'gpu':
            components = loadGPUs()
            break
        case 'motherboard':
            components = loadMotherboards()
            break
        case 'ram':
            components = loadRAM()
            break
        case 'storage':
            components = loadStorage()
            break
        case 'psu':
            components = loadPSUs()
            break
        case 'case':
            components = loadCases()
            break
        case 'cooler':
            components = loadCoolers()
            break
        case 'monitor':
            components = loadMonitors()
            break
        default:
            components = []
    }

    // Apply search filter
    if (options?.search) {
        const searchLower = options.search.toLowerCase()
        components = components.filter(c =>
            c.name.toLowerCase().includes(searchLower)
        )
    }

    // Apply limit
    if (options?.limit) {
        components = components.slice(0, options.limit)
    }

    // Transform to API-friendly format
    return components.map(c => ({
        name: c.name,
        price: c.pricePHP,
        specs: c.specs,
        wattage: c.wattage,
    }))
}

