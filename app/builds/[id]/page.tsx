import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import BuildDetailClient from "./build-detail-client"

// Force dynamic rendering - page requires authentication
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return {
        title: `Build Details | Hephaestus`,
    }
}

export default async function BuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Redirect if Supabase is not configured
    if (!supabase) {
        redirect("/")
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    const { data: build, error } = await supabase
        .from("builds")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (error || !build) {
        notFound()
    }

    return <BuildDetailClient build={build} />
}
