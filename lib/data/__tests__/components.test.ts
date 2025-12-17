
import { describe, it, expect } from 'vitest'
import { formatCPUsForPrompt } from '../components'
import { ProcessedCPU } from '../components'

describe('Component Formatting', () => {
    it('formatCPUsForPrompt should format price without currency symbol', () => {
        const mockCPUs: ProcessedCPU[] = [
            {
                id: 'cpu-1',
                name: 'Test CPU',
                type: 'cpu',
                price: 10000,
                pricePHP: 15000,
                specs: 'Test Specs',
                wattage: 65,
                image: '',
                description: '',
                manufacturer: 'Intel',
                socket: 'LGA1700',
                cores: 8,
                threads: 16,
                baseClock: 3.5,
                boostClock: 5.0,
                integratedGraphics: false,
                links: []
            }
        ]

        const result = formatCPUsForPrompt(mockCPUs)
        expect(result).toContain('Price: 15000')
        expect(result).not.toContain('₱')
        expect(result).toContain('Test CPU')
    })
})
