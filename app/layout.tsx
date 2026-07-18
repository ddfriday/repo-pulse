import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "RepoPulse — Discover rising GitHub repositories",
    template: "%s · RepoPulse",
  },
  description:
    "Discover new and rising GitHub repositories through early traction, freshness, activity, and growth trends.",
  keywords: [
    "GitHub trending",
    "GitHub 热门项目",
    "开源项目排行榜",
    "repository discovery",
    "open source",
    "GitHub stars",
    "developer tools",
  ],
  openGraph: {
    title: "RepoPulse",
    description:
      "Track new repository momentum across early traction, freshness, and activity.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoPulse",
    description: "Discover what is rising across public GitHub repositories.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("font-sans antialiased", geist.variable, fontMono.variable)}
    >
      <body>{children}</body>
    </html>
  )
}
