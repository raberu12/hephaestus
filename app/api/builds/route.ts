import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ComponentType, PCComponent, ComponentReasoning } from '@/lib/types'

// GET: Fetch all builds for authenticated user
export async function GET() {
    const supabase = await createClient()

    if (!supabase) {
        return NextResponse.json(
            { error: 'Service unavailable' },
            { status: 503 }
        )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const { data: builds, error } = await supabase
        .from('builds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching builds:', error)
        return NextResponse.json(
            { error: 'Failed to fetch builds' },
            { status: 500 }
        )
    }

    return NextResponse.json({ builds })
}

// POST: Save a new build for authenticated user
export async function POST(request: Request) {
    const supabase = await createClient()

    if (!supabase) {
        return NextResponse.json(
            { error: 'Service unavailable' },
            { status: 503 }
        )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()
        const { name, build, reusedParts, reasoning, totalPrice } = body as {
            name: string
            build: Record<ComponentType, PCComponent>
            reusedParts: ComponentType[]
            reasoning: ComponentReasoning
            totalPrice: number
        }

        if (!name || !build || !reasoning) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('builds')
            .insert({
                user_id: user.id,
                name,
                build,
                reused_parts: reusedParts || [],
                reasoning,
                total_price: totalPrice || 0,
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving build:', error)
            return NextResponse.json(
                { error: 'Failed to save build' },
                { status: 500 }
            )
        }

        return NextResponse.json({ build: data }, { status: 201 })
    } catch (error) {
        console.error('Error processing request:', error)
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        )
    }
}
