import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full">
              {/* This is the sidebar area layout */}
              <div className="hidden md:block w-64 border-r bg-background">
                <div className="p-4 font-semibold border-b">ORE Workspace</div>
              </div>
              
              {/* Main application screen area */}
              <main className="flex-1 overflow-y-auto p-6">
                <SidebarTrigger className="mb-4" />
                {children}
              </main>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}