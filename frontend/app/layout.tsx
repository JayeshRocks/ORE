import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Inter, Noto_Serif } from "next/font/google"

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const notoSerif = Noto_Serif({
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
      <body className={`${sans.variable} ${notoSerif.variable} antialiased bg-black min-h-screen font-sans`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}