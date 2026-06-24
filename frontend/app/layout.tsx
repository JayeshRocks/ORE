import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#09090b]">
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full bg-[#09090b] text-white antialiased overflow-hidden">
              
              {/* Premium Left Fixed Sidebar Navigation */}
              <Sidebar variant="sidebar" collapsible="icon" className="border-r border-[#1f1f23] bg-[#0c0c0e] h-full">
                
                {/* Fixed Brand Header - Height matched perfectly to top main navbar */}
                <SidebarHeader className="h-14 px-4 flex flex-row items-center gap-3 border-b border-[#1f1f23] shrink-0 justify-start overflow-hidden">
                  <div className="h-7 w-7 shrink-0 rounded-md bg-white text-black flex items-center justify-center font-black text-xs tracking-tighter shadow-sm">
                    O
                  </div>
                  <div className="flex flex-col min-w-0 transition-opacity duration-150 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 select-none">
                    <span className="font-bold text-xs tracking-tight text-white leading-none">ORE Workspace</span>
                    <span className="text-[9px] text-zinc-500 font-medium tracking-wider mt-0.5 uppercase">by KOSS</span>
                  </div>
                </SidebarHeader>
                
                {/* Navigation Items - Fixed list mapping to standard routes */}
                <SidebarContent className="p-2 overflow-y-auto">
                  <SidebarGroup>
                    <SidebarMenu className="space-y-1">
                      {[
                        { name: "Dashboard", icon: "🎛️", href: "/" },
                        { name: "Notes Workspace", icon: "📝", href: "/notes" },
                        { name: "AI Chat Assistant", icon: "🤖", href: "/chat" },
                      ].map((item) => (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton asChild className="w-full font-medium rounded-md px-3 h-10 transition-all duration-200 text-xs flex items-center gap-3 text-zinc-400 hover:bg-[#121214] hover:text-white">
                            <a href={item.href}>
                              <span className="text-sm shrink-0 flex items-center justify-center w-5 h-5">{item.icon}</span>
                              <span className="group-data-[state=collapsed]:hidden truncate tracking-wide">{item.name}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
              
              {/* Main Content Window Frame */}
              <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                
                {/* Upper Unified Navbar Header */}
                <header className="flex h-14 items-center gap-4 border-b border-[#1f1f23] bg-[#09090b] px-6 shrink-0 select-none">
                  <SidebarTrigger className="h-8 w-8 rounded-md border border-[#27272a] bg-[#0c0c0e] text-zinc-400 hover:bg-[#18181b] hover:text-white flex items-center justify-center transition-colors shadow-sm" />
                  <div className="h-4 w-px bg-[#27272a]" />
                  <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">Workspace Root</span>
                </header>
                
                {/* Scrollable Main Application Portal Grid */}
                <main className="flex-1 overflow-y-auto bg-[#09090b] p-6 lg:p-8 relative">
                  <div className="max-w-6xl mx-auto w-full pb-20">
                    {children}
                  </div>
                </main>
              </div>

            </div>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}