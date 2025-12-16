"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { LogOut, FolderOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserMenuProps {
    user: SupabaseUser
}

export default function UserMenu({ user }: UserMenuProps) {
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()

        if (!supabase) {
            toast.error("Authentication is not configured")
            return
        }

        const { error } = await supabase.auth.signOut()

        if (error) {
            toast.error("Failed to sign out")
            return
        }

        toast.success("Signed out successfully")
        router.refresh()
    }

    // Get initials from email
    const initials = user.email
        ?.split("@")[0]
        .slice(0, 2)
        .toUpperCase() || "U"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Account</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/builds" className="cursor-pointer">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        My Builds
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
