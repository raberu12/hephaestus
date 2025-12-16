"use client"

import BuildResult from "@/components/build-result"
import type { PCComponent, ComponentType } from "@/lib/types"

// Mock data for testing the build result UI
const mockBuild: Record<ComponentType, PCComponent & { links?: { store: string; url: string }[] }> = {
    cpu: {
        id: "cpu-mock",
        name: "AMD Ryzen 5 5600",
        type: "cpu",
        price: 6995,
        specs: "6 cores, 12 threads, 3.5GHz base / 4.4GHz boost",
        wattage: 65,
        links: [
            { store: "Lazada", url: "https://www.lazada.com.ph" },
            { store: "Shopee", url: "https://shopee.ph" },
        ],
    },
    gpu: {
        id: "gpu-mock",
        name: "NVIDIA GeForce RTX 4060",
        type: "gpu",
        price: 18500,
        specs: "8GB GDDR6, DLSS 3, Ray Tracing",
        wattage: 115,
        links: [
            { store: "PC Hub", url: "https://pchub.com" },
            { store: "DynaQuest", url: "https://dynaquestpc.com" },
        ],
    },
    motherboard: {
        id: "mb-mock",
        name: "MSI B550M PRO-VDH WiFi",
        type: "motherboard",
        price: 5995,
        specs: "AM4, DDR4, PCIe 4.0, WiFi 6",
        wattage: 50,
        links: [
            { store: "Lazada", url: "https://www.lazada.com.ph" },
            { store: "ITWorld", url: "https://itworld.com.ph" },
        ],
    },
    ram: {
        id: "ram-mock",
        name: "Kingston Fury Beast 16GB (2x8GB) DDR4-3200",
        type: "ram",
        price: 2495,
        specs: "16GB DDR4-3200 CL16, Dual Channel",
        wattage: 10,
        links: [
            { store: "Shopee", url: "https://shopee.ph" },
            { store: "EasyPC", url: "https://easypc.com.ph" },
        ],
    },
    storage: {
        id: "storage-mock",
        name: "Kingston NV2 500GB NVMe SSD",
        type: "storage",
        price: 1895,
        specs: "500GB NVMe PCIe 4.0, 3500MB/s read",
        wattage: 5,
        links: [
            { store: "Lazada", url: "https://www.lazada.com.ph" },
            { store: "PC Hub", url: "https://pchub.com" },
        ],
    },
    psu: {
        id: "psu-mock",
        name: "Cooler Master MWE 650W 80+ Bronze",
        type: "psu",
        price: 3295,
        specs: "650W, 80+ Bronze, Non-modular",
        wattage: 0,
        links: [
            { store: "DynaQuest", url: "https://dynaquestpc.com" },
            { store: "Shopee", url: "https://shopee.ph" },
        ],
    },
    case: {
        id: "case-mock",
        name: "Tecware Forge M ARGB",
        type: "case",
        price: 2495,
        specs: "Micro-ATX, 3x ARGB Fans, Mesh Front",
        wattage: 0,
        links: [
            { store: "Lazada", url: "https://www.lazada.com.ph" },
            { store: "EasyPC", url: "https://easypc.com.ph" },
        ],
    },
    cooler: {
        id: "cooler-mock",
        name: "ID-Cooling SE-214-XT",
        type: "cooler",
        price: 995,
        specs: "Tower cooler, 120mm fan, 4 heatpipes",
        wattage: 5,
        links: [
            { store: "Shopee", url: "https://shopee.ph" },
            { store: "PC Hub", url: "https://pchub.com" },
        ],
    },
    monitor: {
        id: "monitor-mock",
        name: "ASUS VG249Q1A 24\" 165Hz",
        type: "monitor",
        price: 8995,
        specs: "24\" IPS, 1080p, 165Hz, 1ms, FreeSync",
        wattage: 25,
        links: [
            { store: "Lazada", url: "https://www.lazada.com.ph" },
            { store: "PC Hub", url: "https://pchub.com" },
        ],
    },
}

const mockReasoning = {
    overall: "This budget gaming build maximizes value with the Ryzen 5 5600 and RTX 4060 combo. It delivers excellent 1080p and solid 1440p gaming performance while staying well under budget.",
    componentExplanations: {
        cpu: "The Ryzen 5 5600 offers exceptional gaming performance at an unbeatable price point. Its 6 cores handle modern games with ease.",
        gpu: "The RTX 4060 provides ray tracing and DLSS 3 support, ensuring great 1080p and playable 1440p gaming for years to come.",
        motherboard: "B550 chipset with WiFi 6 built-in, PCIe 4.0 support, and solid VRMs for the 5600.",
        ram: "16GB DDR4-3200 is the sweet spot for gaming. Kingston Fury Beast offers good speeds at a reasonable price.",
        storage: "500GB NVMe is enough for OS and a few games. Fast PCIe 4.0 speeds at an entry-level price.",
        psu: "650W provides headroom for the RTX 4060 and future upgrades. 80+ Bronze efficiency keeps power costs down.",
        case: "Great airflow with mesh front panel and included RGB fans at a budget price.",
        cooler: "The SE-214-XT keeps the 5600 cool and quiet without breaking the bank.",
    },
}

const mockReusedParts: ComponentType[] = ["storage", "case"]

export default function MockPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-12 max-w-[1400px]">
                <div className="mb-8 text-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600">Mock Preview</span>
                </div>
                <BuildResult
                    build={mockBuild}
                    reusedParts={mockReusedParts}
                    reasoning={mockReasoning}
                    onReset={() => window.location.href = "/"}
                />
            </div>
        </div>
    )
}
