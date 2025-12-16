"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, Calendar, Wallet, FolderOpen, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { SavedBuild } from "@/lib/types"

export default function BuildsClient() {
    const [builds, setBuilds] = useState<SavedBuild[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetchBuilds()
    }, [])

    const fetchBuilds = async () => {
        try {
            const response = await fetch("/api/builds")
            if (!response.ok) throw new Error("Failed to fetch builds")
            const data = await response.json()
            setBuilds(data.builds)
        } catch (error) {
            console.error("Error fetching builds:", error)
            toast.error("Failed to load builds")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const response = await fetch(`/api/builds/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete build")

            setBuilds((prev) => prev.filter((build) => build.id !== id))
            toast.success("Build deleted")
        } catch (error) {
            console.error("Error deleting build:", error)
            toast.error("Failed to delete build")
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-[1400px]">
            <div className="mb-8 space-y-4">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Builder
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Builds</h1>
                        <p className="text-muted-foreground mt-1">
                            {builds.length} saved build{builds.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {builds.length === 0 ? (
                <Card className="p-12 text-center">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No saved builds yet</h2>
                    <p className="text-muted-foreground mb-6">
                        Complete a build quiz and save your recommendations here.
                    </p>
                    <Button asChild>
                        <Link href="/">Create Your First Build</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {builds.map((build) => (
                        <Card key={build.id} className="p-6 hover:border-primary/50 transition-colors group">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate">{build.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(build.created_at)}
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {deletingId === build.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Build</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete &quot;{build.name}&quot;? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(build.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-primary" />
                                        <span className="font-bold">
                                            ₱{build.total_price.toLocaleString()}
                                        </span>
                                    </div>
                                    {build.reused_parts && build.reused_parts.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {build.reused_parts.length} reused
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {Object.keys(build.build).slice(0, 4).map((type) => (
                                        <Badge key={type} variant="outline" className="text-xs">
                                            {type.toUpperCase()}
                                        </Badge>
                                    ))}
                                    {Object.keys(build.build).length > 4 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{Object.keys(build.build).length - 4}
                                        </Badge>
                                    )}
                                </div>

                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/builds/${build.id}`}>View Details</Link>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
