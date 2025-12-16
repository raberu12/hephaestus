import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import type { QuizAnswers, ComponentType } from "@/lib/types"

export const maxDuration = 60 // Increased for web search

interface RecommendRequest {
  answers: QuizAnswers
}

const ALL_COMPONENTS: { type: ComponentType; label: string; minSpec?: string }[] = [
  { type: "cpu", label: "CPU (Processor)" },
  { type: "gpu", label: "GPU (Graphics Card)" },
  { type: "motherboard", label: "Motherboard" },
  { type: "ram", label: "RAM (Memory)", minSpec: "at least 16GB" },
  { type: "storage", label: "Storage (SSD)", minSpec: "at least 500GB" },
  { type: "psu", label: "PSU (Power Supply)" },
  { type: "case", label: "Case" },
  { type: "cooler", label: "CPU Cooler" },
]

export async function POST(req: Request) {
  try {
    const { answers }: RecommendRequest = await req.json()

    const budgetPhp = answers.budget
    const reusedParts = answers.existingParts || []

    // Filter out components that are being reused
    const componentsToSearch = ALL_COMPONENTS.filter(
      (comp) => !reusedParts.includes(comp.type)
    )

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

    // Build the component list for the prompt
    const componentList = componentsToSearch
      .map((c, i) => `${i + 1}. ${c.label}${c.minSpec ? ` - ${c.minSpec}` : ""}`)
      .join("\n")

    // Build JSON template for components to search (includes shopping links)
    const componentJsonTemplate = componentsToSearch
      .map((c) => `    "${c.type}": { "name": "full product name", "price": 12345, "specs": "brief specs", "wattage": 65, "links": [{"store": "Lazada", "url": "https://..."}, {"store": "Shopee", "url": "https://..."}] }`)
      .join(",\n")

    const notesJsonTemplate = componentsToSearch
      .map((c) => `    "${c.type}": "why this ${c.label}"`)
      .join(",\n")

    const prompt = `You are a PC building expert helping someone in the Philippines. Search for current PC component prices from Philippine retailers (Lazada, Shopee, PC Hub, DynaQuest, ITWorld, EasyPC, etc.).

BUILD REQUIREMENTS:
- STRICT BUDGET: ₱${budgetPhp.toLocaleString()} PHP - Total MUST NOT exceed this
- Primary Use: ${answers.primaryUse}
- Performance Priority: ${answers.performancePriority}
- Target: ${answers.targetResolution} @ ${answers.refreshRateGoal}
- CPU Preference: ${answers.brandPreferences.cpu === "any" ? "No preference" : answers.brandPreferences.cpu}
- GPU Preference: ${answers.brandPreferences.gpu === "any" ? "No preference" : answers.brandPreferences.gpu}
${reusedParts.length > 0 ? `\nNOTE: User is REUSING these components: ${reusedParts.join(", ")}. Do NOT include them.` : ""}

Search for CURRENT Philippine prices and recommend ONE component for each:
${componentList}

IMPORTANT:
- Find real prices from Philippine stores
- Total of all ${componentsToSearch.length} components MUST be under ₱${budgetPhp.toLocaleString()}
- Pick value-oriented parts that fit the budget
- Include specific model names and prices you found
- Include at least 2 real shopping links per component (from Lazada, Shopee, PC Hub, etc.)

Return ONLY valid JSON in this exact format:
{
  "components": {
${componentJsonTemplate}
  },
  "totalPrice": 12345,
  "reasoning": "Exactly 2 brief sentences summarizing the build philosophy.",
  "notes": {
${notesJsonTemplate}
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
    const build: Record<ComponentType, { id: string; name: string; type: ComponentType; price: number; specs: string; wattage: number; links?: { store: string; url: string }[] }> = {} as any

    componentsToSearch.forEach(({ type }) => {
      const comp = recommendation.components[type]
      if (comp) {
        build[type] = {
          id: `${type}-live`,
          name: comp.name || "Unknown",
          type: type,
          price: comp.price || 0,
          specs: comp.specs || "",
          wattage: comp.wattage || 0,
          links: comp.links || [],
        }
      }
    })

    return Response.json({
      build,
      reusedParts,
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
