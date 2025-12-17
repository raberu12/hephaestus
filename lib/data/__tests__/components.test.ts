
import { describe, it, expect } from 'vitest'
import { formatCPUsForPrompt } from '../components'
import { ProcessedCPU } from '../components'

describe('Component Formatting', () => {
    it('formatCPUsForPrompt should format price without currency symbol', () => {
        const mockCPUs: ProcessedCPU[] = [
            {
                name: 'Test CPU',
                priceUSD: 200,
                pricePHP: 15000,
                specs: 'Test Specs',
                wattage: 65,
                coreCount: 8,
                coreClock: 3.5,
                boostClock: 5.0,
                microarchitecture: 'Gen 14',
                tdp: 65,
                hasIntegratedGraphics: false,
                brand: 'intel'
            }
        ]

        const result = formatCPUsForPrompt(mockCPUs)
        expect(result).toContain('Price: 15000')
        expect(result).not.toContain('₱')
        expect(result).toContain('Test CPU')
    })
})
