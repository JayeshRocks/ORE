import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Inter, JetBrains_Mono } from "next/font/google"

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "ORE — AI-Powered Academic Knowledge Base",
  description: "A self-hostable repository for indexing, chunking, and querying scientific literature and PDF documents.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${jetbrainsMono.variable} antialiased bg-black min-h-screen font-sans`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}