import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE: Delete a specific build (owner only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

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

    // RLS will ensure user can only delete their own builds
    const { error } = await supabase
        .from('builds')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting build:', error)
        return NextResponse.json(
            { error: 'Failed to delete build' },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}

// GET: Fetch a specific build
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

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

    const { data: build, error } = await supabase
        .from('builds')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !build) {
        return NextResponse.json(
            { error: 'Build not found' },
            { status: 404 }
        )
    }

    return NextResponse.json({ build })
}
