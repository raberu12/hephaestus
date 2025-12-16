import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import SiteHeader from "@/components/site-header"
import "./globals.css"

export const metadata: Metadata = {
  title: "Hephaestus - Forge Your Perfect Build",
  description:
    "Build your perfect PC with AI-powered component recommendations. Answer a quiz and receive a personalized build optimized for your budget and needs.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased dark">
        <SiteHeader />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
