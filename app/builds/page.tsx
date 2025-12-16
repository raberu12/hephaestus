import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import BuildsClient from "./builds-client"

// Force dynamic rendering - page requires authentication
export const dynamic = 'force-dynamic'

export const metadata = {
    title: "My Builds | Hephaestus",
    description: "View and manage your saved PC builds",
}

export default async function BuildsPage() {
    const supabase = await createClient()

    // Redirect if Supabase is not configured or user is not logged in
    if (!supabase) {
        redirect("/")
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    return <BuildsClient />
}
