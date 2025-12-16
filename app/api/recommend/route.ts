import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import type { QuizAnswers, ComponentType } from "@/lib/types"

export const maxDuration = 60 // Increased for web search

interface RecommendRequest {
  answers: QuizAnswers
}

export async function POST(req: Request) {
  try {
    const { answers }: RecommendRequest = await req.json()

    const budgetPhp = answers.budget

    const prompt = `You are a PC building expert helping someone in the Philippines. Search for current PC component prices from Philippine retailers (Lazada, Shopee, PC Hub, DynaQuest, ITWorld, EasyPC, etc.).

BUILD REQUIREMENTS:
- STRICT BUDGET: ₱${budgetPhp.toLocaleString()} PHP - Total MUST NOT exceed this
- Primary Use: ${answers.primaryUse}
- Performance Priority: ${answers.performancePriority}
- Target: ${answers.targetResolution} @ ${answers.refreshRateGoal}
- CPU Preference: ${answers.brandPreferences.cpu === "any" ? "No preference" : answers.brandPreferences.cpu}
- GPU Preference: ${answers.brandPreferences.gpu === "any" ? "No preference" : answers.brandPreferences.gpu}

Search for CURRENT Philippine prices and recommend ONE component for each:
1. CPU (Processor)
2. GPU (Graphics Card)
3. Motherboard
4. RAM (Memory) - at least 16GB
5. Storage (SSD) - at least 500GB
6. PSU (Power Supply)
7. Case
8. CPU Cooler

IMPORTANT:
- Find real prices from Philippine stores
- Total of all 8 components MUST be under ₱${budgetPhp.toLocaleString()}
- Pick value-oriented parts that fit the budget
- Include specific model names and prices you found

Return ONLY valid JSON in this exact format:
{
  "components": {
    "cpu": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 65 },
    "gpu": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 150 },
    "motherboard": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 50 },
    "ram": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 10 },
    "storage": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 5 },
    "psu": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 0 },
    "case": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 0 },
    "cooler": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 10 }
  },
  "totalPrice": 12345,
  "reasoning": "2-3 sentences explaining the build",
  "notes": {
    "cpu": "why this CPU",
    "gpu": "why this GPU",
    "motherboard": "why this motherboard",
    "ram": "why this RAM",
    "storage": "why this storage",
    "psu": "why this PSU",
    "case": "why this case",
    "cooler": "why this cooler"
  }
}`

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
      temperature: 0.3,
      providerOptions: {
        google: {
          useSearchGrounding: true,
        },
      },
    })

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const recommendation = JSON.parse(jsonMatch[0])

    // Transform to expected format
    const build: Record<ComponentType, { id: string; name: string; type: ComponentType; price: number; specs: string; wattage: number }> = {} as any

    const componentTypes: ComponentType[] = ["cpu", "gpu", "motherboard", "ram", "storage", "psu", "case", "cooler"]

    componentTypes.forEach((type) => {
      const comp = recommendation.components[type]
      if (comp) {
        build[type] = {
          id: `${type}-live`,
          name: comp.name || "Unknown",
          type: type,
          price: comp.price || 0,
          specs: comp.specs || "",
          wattage: comp.wattage || 0,
        }
      }
    })

    return Response.json({
      build,
      reasoning: {
        overall: recommendation.reasoning || "AI-generated build recommendation based on current Philippine prices.",
        componentExplanations: recommendation.notes || {},
      },
    })
  } catch (error) {
    console.error("Recommendation error:", error)
    return Response.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}
