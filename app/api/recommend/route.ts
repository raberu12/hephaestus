import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { COMPONENT_TYPES, type ComponentType } from "@/lib/types"
import { RecommendRequestSchema, AIRecommendationSchema } from "@/lib/validation/schemas"
import { logger, withTiming } from "@/lib/logger"
import { errorResponse, successResponse } from "@/lib/api/response"
import { ZodError } from "zod"
import {
  filterCPUs,
  filterGPUs,
  formatCPUsForPrompt,
  formatGPUsForPrompt,
  estimateFPS,
  type ProcessedGPU
} from "@/lib/data/components"

export const maxDuration = 60

import { env } from "@/lib/env"

// Initialize OpenRouter with API key
const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

// Generate search URLs for Philippine retailers
function generateShopLinks(productName: string): { store: string; url: string }[] {
  const encodedName = encodeURIComponent(productName)
  return [
    { store: "Lazada", url: `https://www.lazada.com.ph/catalog/?q=${encodedName}` },
    { store: "Shopee", url: `https://shopee.ph/search?keyword=${encodedName}` },
  ]
}

// Determine which components to include based on use case
function getComponentsForUseCase(
  primaryUse: string,
  reusedParts: ComponentType[]
): { value: ComponentType; label: string; minSpec?: string }[] {
  // For productivity, we might not need a discrete GPU (APU handles it)
  const isProductivity = primaryUse === "productivity"

  // Filter components based on use case
  return COMPONENT_TYPES.filter((comp) => {
    // Skip reused parts
    if (reusedParts.includes(comp.value)) return false

    // For productivity, skip GPU (recommend APU instead in CPU selection)
    if (isProductivity && comp.value === "gpu") return false

    return true
  })
}

export async function POST(req: Request) {
  const startTime = performance.now()

  try {
    // Validate request body with Zod
    const body = await req.json()
    const { answers } = RecommendRequestSchema.parse(body)

    const budgetPhp = answers.budget
    const reusedParts = answers.existingParts || []
    const identifiedParts = answers.identifiedReusedParts || {}
    const isProductivity = answers.primaryUse === "productivity"
    const isGaming = answers.primaryUse === "gaming"

    logger.info('Recommendation request received', {
      budget: budgetPhp,
      primaryUse: answers.primaryUse,
      performancePriority: answers.performancePriority,
      reusedPartsCount: reusedParts.length,
      identifiedPartsCount: Object.keys(identifiedParts).length,
    })



    // Get components based on use case
    const componentsToSearch = getComponentsForUseCase(answers.primaryUse, reusedParts)

    // If all components are reused, return empty build
    if (componentsToSearch.length === 0) {
      return Response.json({
        build: {},
        reusedParts,
        reasoning: {
          overall: "All components are being reused from your existing build.",
          componentExplanations: {},
        },
      })
    }

    // ═══════════════════════════════════════════════════════════════
    // Filter components from database based on quiz answers
    // ═══════════════════════════════════════════════════════════════

    // Filter CPUs based on budget and brand preference
    const filteredCPUs = filterCPUs({
      maxBudgetPHP: budgetPhp,
      brandPreference: answers.brandPreferences.cpu as 'any' | 'intel' | 'amd',
      requireIntegratedGraphics: isProductivity, // APUs for productivity
      limit: 25,
    })

    // Filter GPUs based on budget and brand preference (skip for productivity)
    let filteredGPUs: ProcessedGPU[] = []
    let selectedGPUTier = 0
    if (!isProductivity) {
      filteredGPUs = filterGPUs({
        maxBudgetPHP: budgetPhp,
        brandPreference: answers.brandPreferences.gpu as 'any' | 'nvidia' | 'amd',
        limit: 25,
      })
      // Get the highest tier GPU for FPS estimation
      if (filteredGPUs.length > 0) {
        selectedGPUTier = Math.max(...filteredGPUs.map(g => g.tier))
      }
    }

    // Format component lists for AI prompt
    const cpuListForPrompt = filteredCPUs.length > 0
      ? `\nAVAILABLE CPUs (select ONE from this list):\n${formatCPUsForPrompt(filteredCPUs)}`
      : ""

    const gpuListForPrompt = !isProductivity && filteredGPUs.length > 0
      ? `\nAVAILABLE GPUs (select ONE from this list):\n${formatGPUsForPrompt(filteredGPUs)}`
      : ""

    // Estimate FPS based on target resolution and best available GPU
    const targetRes = answers.targetResolution as '1080p' | '1440p' | '4k'
    const estimatedFPSRange = selectedGPUTier > 0
      ? estimateFPS(selectedGPUTier, targetRes)
      : { low: 0, high: 0 }

    // Build the component list for the prompt
    const componentList = componentsToSearch
      .map((c, i) => `${i + 1}. ${c.label}${c.minSpec ? ` - ${c.minSpec}` : ""}`)
      .join("\n")

    // Build JSON template for components (NO links - we generate those ourselves)
    const componentJsonTemplate = componentsToSearch
      .map((c) => `    "${c.value}": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 65 }`)
      .join(",\n")

    const notesJsonTemplate = componentsToSearch
      .map((c) => `    "${c.value}": "why this ${c.label}"`)
      .join(",\n")


    // Build use-case specific instructions
    let useCaseInstructions = ""
    if (isProductivity) {
      useCaseInstructions = `
USE CASE: PRODUCTIVITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NO discrete GPU required. Select an APU (CPU with integrated graphics).
- CPU MUST be an APU: AMD Ryzen 5600G, 5700G, 8600G, or 8700G series.
- PRIORITY ORDER: CPU (APU) > RAM > Storage > Other components.
- RAM is critical - recommend 32GB if budget allows, minimum 16GB.
- Focus on multitasking capability and integrated graphics performance.`
    } else if (isGaming) {
      useCaseInstructions = `
USE CASE: GAMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Discrete GPU is MANDATORY - allocate 40-50% of total budget to GPU.
- PRIORITY ORDER: GPU > CPU > RAM > Storage > Other components.
- GPU is the HIGHEST priority - get the best GPU the budget allows.
- CPU must NOT bottleneck the GPU - pair appropriately with GPU tier.
- RAM: 16GB minimum, 32GB preferred for modern games.
- Avoid CPU bottlenecks - match CPU tier to GPU tier.`
    } else if (answers.primaryUse === "content-creation") {
      useCaseInstructions = `
USE CASE: CONTENT CREATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Discrete GPU is MANDATORY for video editing, 3D rendering, etc.
- PRIORITY ORDER: RAM > GPU > CPU > Storage > Other components.
- RAM is the HIGHEST priority - recommend 32GB minimum, 64GB if budget allows.
- GPU for hardware acceleration in editing software.
- CPU with high core count preferred for rendering tasks.
- Fast NVMe storage for large project files.`
    } else {
      // Mixed use
      useCaseInstructions = `
USE CASE: MIXED (GAMING + PRODUCTIVITY + CONTENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Discrete GPU is MANDATORY for versatility.
- PRIORITY ORDER: GPU > RAM > CPU > Storage > Other components.
- Balance gaming performance with productivity capability.
- RAM: 32GB recommended for multitasking across use cases.
- CPU should handle both gaming and productivity workloads.
- Consider overall system versatility over single-use optimization.`
    }

    // Calculate budget targets based on performance priority
    const budgetMin = Math.round(budgetPhp * 0.98)
    const budgetMax = budgetPhp
    const balancedMin = Math.round(budgetPhp * 0.95)
    const balancedMax = budgetPhp
    const valueMin = Math.round(budgetPhp * 0.50)
    const valueMax = Math.round(budgetPhp * 0.75)

    // Build performance priority instructions
    let performancePriorityInstructions = ""
    if (answers.performancePriority === "max-performance") {
      performancePriorityInstructions = `
PERFORMANCE PRIORITY: MAXIMUM PERFORMANCE [HIGHEST PRIORITY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUDGET TARGET: ₱${budgetMin.toLocaleString()} - ₱${budgetMax.toLocaleString()} (98-100% of budget)
ACCEPTABLE VARIANCE: ±2% MAXIMUM

MANDATORY RULES:
1. SELECT THE ABSOLUTE BEST COMPONENTS regardless of price efficiency.
2. Price-to-performance ratio is IRRELEVANT - only raw performance matters.
3. Diminishing returns are EXPECTED and ACCEPTABLE in this mode.
4. If a more expensive component offers even marginal performance gains, SELECT IT.
5. USE THE FULL BUDGET. Underspending is a FAILURE condition.
6. Do NOT suggest "value" alternatives or cost savings.

FAILURE CONDITIONS:
- Total below ₱${budgetMin.toLocaleString()} without technical justification.
- Selecting mid-tier when high-tier fits budget.
- Considering price-to-performance ratio.`
    } else if (answers.performancePriority === "value") {
      performancePriorityInstructions = `
PERFORMANCE PRIORITY: BEST VALUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUDGET TARGET: ₱${valueMin.toLocaleString()} - ₱${valueMax.toLocaleString()} (50-75% of budget)

MANDATORY RULES:
1. Optimize for price-to-performance ratio.
2. Select components with best value, NOT highest tier.
3. Underspending is EXPECTED and encouraged.
4. Avoid diminishing returns - stay in value sweet spot.
5. Total CAN be significantly under budget if value is optimal.
6. Prioritize components that offer the most performance per peso.`
    } else {
      performancePriorityInstructions = `
PERFORMANCE PRIORITY: BALANCED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUDGET TARGET: ₱${balancedMin.toLocaleString()} - ₱${balancedMax.toLocaleString()} (95-100% of budget)

MANDATORY RULES:
1. GET AS CLOSE TO THE MAXIMUM BUDGET AS POSSIBLE.
2. Select solid mid-to-high tier components.
3. Balance performance with reasonable value considerations.
4. Do NOT leave significant budget unused - utilize 95%+ of budget.
5. If within budget, prefer better components over saving money.
6. Only leave headroom if it would cause component mismatch.`
    }

    const reusedPartsDisplay = reusedParts.map(type => {
      const part = identifiedParts[type as ComponentType]
      return part
        ? `${type.toUpperCase()} (Model: ${part.name}, Specs: ${part.specs}, Wattage: ${part.wattage}W)`
        : type.toUpperCase()
    }).join(", ")

    const prompt = `You are a PC component recommendation system. You MUST follow ALL rules below with zero deviation.

═══════════════════════════════════════════════════════════════
SYSTEM RULES (MANDATORY - NO EXCEPTIONS)
═══════════════════════════════════════════════════════════════

RULE 1: QUIZ RESULTS ARE AUTHORITATIVE
- All selections below are from user's quiz. They are BINDING.
- You CANNOT override, reinterpret, or deviate from these inputs.
- No assumptions. No defaults. No heuristics. Only quiz data.

RULE 2: BUDGET IS A HARD CONSTRAINT
- Maximum Budget: ₱${budgetPhp.toLocaleString()} PHP
- You MUST NOT exceed this amount under any circumstance.
- Underspending rules depend on Performance Priority (see below).

RULE 3: NO UNSOLICITED COST SAVINGS
- Do NOT suggest "saving money" unless user selected "Best Value."
- Do NOT downgrade components to appear "reasonable" or "safe."
- If budget allows better, you MUST recommend better.

RULE 4: TRANSPARENCY REQUIRED
- If exact budget matching is impossible, state the exact variance.
- State any technical limitations preventing optimal selection.
- No hedging language. Be precise and declarative.

RULE 5: STRICT JSON FORMATTING
- "price" fields MUST be integers (e.g., 25000).
- NO strings, NO commas, NO currency symbols (₱, PHP) in JSON numbers.
- Example: "price": 25000 (CORRECT). "price": "₱25,000" (WRONG).

═══════════════════════════════════════════════════════════════
USER'S QUIZ SELECTIONS (BINDING)
═══════════════════════════════════════════════════════════════

BUDGET: ₱${budgetPhp.toLocaleString()} PHP
PRIMARY USE: ${answers.primaryUse}
PERFORMANCE PRIORITY: ${answers.performancePriority}
TARGET DISPLAY: ${answers.targetResolution} @ ${answers.refreshRateGoal}
CPU BRAND: ${answers.brandPreferences.cpu === "any" ? "No preference" : answers.brandPreferences.cpu.toUpperCase()}
GPU BRAND: ${answers.brandPreferences.gpu === "any" ? "No preference" : answers.brandPreferences.gpu.toUpperCase()}
${reusedParts.length > 0 ? `REUSING: ${reusedPartsDisplay} (EXCLUDE from recommendations)` : ""}

${useCaseInstructions}
${performancePriorityInstructions}

═══════════════════════════════════════════════════════════════
COMPONENTS TO RECOMMEND
═══════════════════════════════════════════════════════════════

${componentList}
${cpuListForPrompt}
${gpuListForPrompt}

IMPORTANT: For CPU and GPU, you MUST select from the available lists above.
Use the EXACT name and price from the list. Do not invent components.
For other components (motherboard, RAM, storage, PSU, case, cooler, monitor),
use current Philippine market prices and real product names.

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT (STRICT JSON - NO MARKDOWN, NO EXPLANATION)
═══════════════════════════════════════════════════════════════

{
  "components": {
${componentJsonTemplate}
  },
  "totalPrice": 12345,
  "reasoning": "Two sentences only. State what was built and how budget was utilized.",
  "notes": {
${notesJsonTemplate}
  }
}`

    // Use OpenRouter with a FREE model
    const { text } = await withTiming('AI generation', async () => {
      return generateText({
        model: openrouter("google/gemini-2.0-flash-001"),
        prompt,
        temperature: 0.3,
      })
    }, { model: 'gemini-2.0-flash-001' })

    // Parse the AI response with Zod validation
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      logger.error('Failed to extract JSON from AI response', { response: text.slice(0, 500) })
      throw new Error("Failed to parse AI response - no JSON found")
    }

    let recommendation
    try {
      const parsed = JSON.parse(jsonMatch[0])
      recommendation = AIRecommendationSchema.parse(parsed)
    } catch (parseError) {
      logger.error('AI response validation failed', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        response: jsonMatch[0].slice(0, 500)
      })
      throw new Error("AI response did not match expected schema")
    }

    // Transform to expected format and add generated shop links
    const build: Record<ComponentType, { id: string; name: string; type: ComponentType; price: number; specs: string; wattage: number; links: { store: string; url: string }[] }> = {} as any

    componentsToSearch.forEach(({ value: type }) => {
      const comp = recommendation.components[type]
      if (comp) {
        const productName = comp.name || "Unknown"
        build[type] = {
          id: `${type}-live`,
          name: productName,
          type: type,
          price: comp.price || 0,
          specs: comp.specs || "",
          wattage: comp.wattage || 0,
          // Generate search links based on product name
          links: generateShopLinks(productName),
        }
      }
    })

    // Inject identified identified reused parts into the build
    Object.entries(identifiedParts).forEach(([type, component]) => {
      // Valid type check (mostly for safety)
      if (reusedParts.includes(type as ComponentType)) {
        build[type as ComponentType] = {
          ...component,
          type: type as ComponentType,
          id: component.id || `reused-${type}`,
          links: component.links || [],
        }
      }
    })

    const duration = Math.round(performance.now() - startTime)

    // Calculate total wattage and PSU headroom
    // Calculate total wattage (excluding PSU itself as it provides power, doesn't consume it like components)
    const totalWattage = Object.values(build).reduce((sum, c) => {
      if (c.type === 'psu') return sum
      return sum + (c?.wattage || 0)
    }, 0)

    const psuWattage = build.psu?.wattage || 0
    const psuHeadroom = psuWattage > 0
      ? Math.round(((psuWattage - totalWattage) / psuWattage) * 100)
      : 0

    logger.info('Recommendation generated successfully', {
      duration: `${duration}ms`,
      componentsCount: Object.keys(build).length,
      totalPrice: Object.values(build).reduce((sum, c) => sum + (c?.price || 0), 0),
    })

    return successResponse({
      build,
      reusedParts,
      reasoning: {
        overall: recommendation.reasoning || "AI-generated build recommendation based on current Philippine prices.",
        componentExplanations: recommendation.notes || {},
      },
      // New metrics for build result header
      metrics: {
        estimatedFPS: estimatedFPSRange,
        psuHeadroom: psuHeadroom,
        totalWattage: totalWattage,
        targetResolution: targetRes,
      },
    })
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Request validation failed', { errors: error.errors, duration: `${duration}ms` })
      return errorResponse('Invalid request data', 400, 'VALIDATION_ERROR', error.errors)
    }

    logger.error('Recommendation generation failed', {
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
    })
    return errorResponse('Failed to generate recommendation', 500)
  }
}
