import { z } from 'zod'
import type { ComponentType } from '@/lib/types'

// ============================================
// Component Type Schema
// ============================================

export const ComponentTypeSchema = z.enum([
    'cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler', 'monitor'
])

// ============================================
// Shopping Link Schema
// ============================================

export const ShoppingLinkSchema = z.object({
    store: z.string(),
    url: z.string().url(),
})

// ============================================
// PC Component Schema
// ============================================

export const PCComponentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    type: ComponentTypeSchema.optional(),
    price: z.number().min(0),
    specs: z.string(),
    wattage: z.number().min(0),
    links: z.array(ShoppingLinkSchema).optional(),
})

// ============================================
// AI Recommendation Response Schema
// ============================================

export const AIRecommendationSchema = z.object({
    components: z.record(z.union([
        z.object({
            name: z.string().min(1),
            price: z.number().min(0),
            specs: z.string(),
            wattage: z.number().min(0),
        }),
        z.null()
    ])),
    totalPrice: z.number().min(0),
    reasoning: z.string(),
    notes: z.record(z.string()),
})

export type AIRecommendation = z.infer<typeof AIRecommendationSchema>

// ============================================
// Quiz Answers Schema
// ============================================

export const QuizAnswersSchema = z.object({
    budget: z.number().min(20000).max(300000),
    primaryUse: z.enum(['gaming', 'productivity', 'content-creation', 'mixed']),
    performancePriority: z.enum(['max-performance', 'balanced', 'value']),
    targetResolution: z.enum(['1080p', '1440p', '4k']),
    refreshRateGoal: z.enum(['60hz', '144hz', '240hz+']),
    brandPreferences: z.object({
        cpu: z.enum(['any', 'intel', 'amd']),
        gpu: z.enum(['any', 'nvidia', 'amd']),
    }),
    existingParts: z.array(ComponentTypeSchema),
    identifiedReusedParts: z.record(PCComponentSchema).optional(),
})

export type QuizAnswersValidated = z.infer<typeof QuizAnswersSchema>

// ============================================
// Component Reasoning Schema
// ============================================

export const ComponentReasoningSchema = z.object({
    overall: z.string(),
    componentExplanations: z.record(z.string()),
    tradeOffs: z.string().optional(),
})

// ============================================
// Save Build Request Schema
// ============================================

export const SaveBuildRequestSchema = z.object({
    name: z.string().min(1, 'Build name is required').max(100, 'Build name too long'),
    build: z.record(PCComponentSchema),
    reusedParts: z.array(ComponentTypeSchema).optional().default([]),
    reasoning: ComponentReasoningSchema,
    totalPrice: z.number().min(0),
})

export type SaveBuildRequest = z.infer<typeof SaveBuildRequestSchema>

// ============================================
// API Request Schema
// ============================================

export const RecommendRequestSchema = z.object({
    answers: QuizAnswersSchema,
})

export type RecommendRequest = z.infer<typeof RecommendRequestSchema>
