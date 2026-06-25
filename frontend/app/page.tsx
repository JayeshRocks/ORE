"use client"

import * as React from "react"
import {
  Send,
  FileText,
  Database,
  Activity,
  ChevronRight,
  Trash2,
  Cpu,
  Sparkles,
  BookOpen,
  CheckCircle,
  Search,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
  BarChart3,
  Layers,
  Plus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LogLine {
  timestamp: string
  level: "INFO" | "WARNING" | "ERROR"
  message: string
}

interface Document {
  id: string
  name: string
  size: string
  status: "ready" | "ingesting" | "chunking" | "embedding" | "failed"
  created: string
  environment: "production" | "preview"
  chunksCount?: number
  charCount?: number
  logs: LogLine[]
}

interface Citation {
  sourceName: string
  pageNumber: number
  snippet: string
  score: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  citations?: Citation[]
}

const SAMPLE_QUESTIONS = [
  "What is the core contribution of this academic paper?",
  "Summarize the methodology used in the experiments.",
  "What limitations did the authors identify in their research?",
  "List the key datasets or frameworks referenced in the text."
]

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default function ShadcnDashboard() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "documents" | "analytics" | "settings">("overview")
  const [documents, setDocuments] = React.useState<Document[]>([
    {
      id: "1",
      name: "sample.pdf",
      size: "107 KB",
      status: "ready",
      created: "2h ago",
      environment: "production",
      chunksCount: 143,
      charCount: 109738,
      logs: [
        { timestamp: "10:14:02", level: "INFO", message: "Starting ingestion process for sample.pdf" },
        { timestamp: "10:14:03", level: "INFO", message: "Extracting pages via PyMuPDF (fitz)" },
        { timestamp: "10:14:03", level: "INFO", message: "Successfully extracted 109738 characters across 12 pages" },
        { timestamp: "10:14:04", level: "INFO", message: "Initializing LangChain RecursiveCharacterTextSplitter" },
        { timestamp: "10:14:04", level: "INFO", message: "Segmented text into 143 semantic chunks (chunk_size=500, overlap=50)" },
        { timestamp: "10:14:05", level: "INFO", message: "Connecting to Ollama embed client (nomic-embed-text)" },
        { timestamp: "10:14:05", level: "INFO", message: "Generated 143 vector embeddings (768-dim)" },
        { timestamp: "10:14:06", level: "INFO", message: "Successfully indexed 143 chunks into SQLite/Chroma vector DB" }
      ]
    }
  ])
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to ORE. Upload scientific papers to chunk and index them locally, then query the literature base using natural language.",
      timestamp: "10:14 AM"
    }
  ])
  const [inputVal, setInputVal] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [backendStatus, setBackendStatus] = React.useState<"checking" | "online" | "offline">("checking")
  const [activeCitation, setActiveCitation] = React.useState<Citation | null>(null)
  
  // Settings controls
  const [chunkSize, setChunkSize] = React.useState(500)
  const [chunkOverlap, setChunkOverlap] = React.useState(50)
  const [embedModel, setEmbedModel] = React.useState("nomic-embed-text")

  // Logs terminal drawer state
  const [viewingLogsDoc, setViewingLogsDoc] = React.useState<Document | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Check backend server status
  const checkBackendHealth = React.useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/health", { mode: "cors" })
      if (response.ok) {
        setBackendStatus("online")
      } else {
        setBackendStatus("offline")
      }
    } catch {
      setBackendStatus("offline")
    }
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkBackendHealth()
    const timer = setInterval(checkBackendHealth, 15000)
    return () => clearInterval(timer)
  }, [checkBackendHealth])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
  }

  const uploadFile = (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      alert("Only PDF files are supported.")
      return
    }

    const docId = `doc-${documents.length}-${file.name.replace(/[^a-zA-Z0-9]/g, "")}`
    
    // Create initial document structure
    const initialLogs: LogLine[] = [
      { timestamp: new Date().toLocaleTimeString([], { hour12: false }), level: "INFO", message: `Initializing ingestion run for ${file.name}` },
      { timestamp: new Date().toLocaleTimeString([], { hour12: false }), level: "INFO", message: "Uploading PDF file payload to secure repository" }
    ]

    const newDoc: Document = {
      id: docId,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      status: "ingesting",
      created: "Just now",
      environment: "preview",
      logs: initialLogs
    }

    setDocuments((prev) => [newDoc, ...prev])
    setActiveTab("documents") // Auto shift to documents to see deployment logs

    // Simulate RAG pipeline progress stages & build logs
    let progressStep = 0
    const interval = setInterval(() => {
      progressStep++
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === docId) {
            const currentLogs = [...d.logs]
            const time = new Date().toLocaleTimeString([], { hour12: false })

            if (progressStep === 1) {
              currentLogs.push({ timestamp: time, level: "INFO", message: "Extracting pages via PyMuPDF package" })
              return { ...d, logs: currentLogs, status: "ingesting" }
            } else if (progressStep === 2) {
              currentLogs.push({ timestamp: time, level: "INFO", message: `Parsed ${Math.floor(file.size / 5000) + 1} pages containing text stream` })
              currentLogs.push({ timestamp: time, level: "INFO", message: `Dividing layout strings into recursive character segments (chunk_size=${chunkSize}, overlap=${chunkOverlap})` })
              return { ...d, logs: currentLogs, status: "chunking" }
            } else if (progressStep === 3) {
              const generatedChunks = Math.floor(file.size / chunkSize) + 6
              currentLogs.push({ timestamp: time, level: "INFO", message: `Split completed. Generated ${generatedChunks} chunks` })
              currentLogs.push({ timestamp: time, level: "INFO", message: `Querying local embedding server model "${embedModel}"` })
              return { ...d, logs: currentLogs, status: "embedding" }
            } else if (progressStep === 4) {
              const generatedChunks = Math.floor(file.size / chunkSize) + 6
              currentLogs.push({ timestamp: time, level: "INFO", message: `Created vector indexes inside Chroma database persistent database client` })
              currentLogs.push({ timestamp: time, level: "INFO", message: "Ingestion pipeline run completed successfully. Status set to ready" })
              clearInterval(interval)
              return {
                ...d,
                status: "ready",
                chunksCount: generatedChunks,
                charCount: file.size * 2,
                logs: currentLogs
              }
            }
          }
          return d
        })
      )
    }, 1200)
  }

  const deleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    if (viewingLogsDoc?.id === id) {
      setViewingLogsDoc(null)
    }
  }

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return

    const userMessage: Message = {
      id: `msg-user-${messages.length}`,
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMessage])
    setInputVal("")
    setIsTyping(true)

    // Simulate vector query latency
    setTimeout(() => {
      let aiContent = ""
      let citations: Citation[] = []

      const activeDocs = documents.filter((d) => d.status === "ready")
      const sourceName = activeDocs.length > 0 ? activeDocs[0].name : "Context Base"

      if (queryText.toLowerCase().includes("contribution") || queryText.toLowerCase().includes("overview")) {
        aiContent = `The core contribution in **${sourceName}** introduces a localized index hierarchy layout to mitigate retrieval computation overhead. By restructuring flat search spaces into dynamic node trees, query execution times drop by 35% without degrading precision metrics.`
        citations = [
          {
            sourceName,
            pageNumber: 1,
            snippet: "We propose a localized index hierarchy (LH) that structures embeddings hierarchically to decrease search space and compute overhead during low-latency retrieval operations.",
            score: 0.94
          },
          {
            sourceName,
            pageNumber: 3,
            snippet: "Table 2 outlines a 35% reduction in latency compared to flat search indices while maintaining 98.4% retrieval recall accuracy metrics.",
            score: 0.89
          }
        ]
      } else if (queryText.toLowerCase().includes("experiment") || queryText.toLowerCase().includes("method")) {
        aiContent = `The authors conducted experiments comparing search recall against standard BM25 systems and classical vector indexing models. Standard benchmark tests verified both indexing speeds and GPU memory constraints.`
        citations = [
          {
            sourceName,
            pageNumber: 5,
            snippet: "All tests ran on local system configurations consisting of 8-core CPUs and consumer-grade GPUs, demonstrating efficiency without high-performance server clusters.",
            score: 0.91
          }
        ]
      } else {
        aiContent = `Searching your literature index for details concerning "${queryText}" matched chunks from **${sourceName}**. The system retrieved overlapping text segments by calculating cosine similarity scores over local vector embeddings.`
        citations = [
          {
            sourceName,
            pageNumber: 2,
            snippet: "The recursive character splitter ensures overlapping sentences remain intact, maintaining high retrieval contextual coherence.",
            score: 0.85
          }
        ]
      }

      const assistantMessage: Message = {
        id: `msg-assistant-${messages.length + 1}`,
        role: "assistant",
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div 
      className="min-h-screen bg-black text-zinc-100 font-sans antialiased flex flex-col selection:bg-zinc-800 selection:text-white relative overflow-x-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 0%, rgba(30, 30, 45, 0.45), rgba(0, 0, 0, 1) 70%), url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v30H0V0zm0 0h30v1H0V0z' fill='rgba(255,255,255,0.015)'/%3E%3C/svg%3E")`
      }}
    >
      
      {/* 🖤 Premium shadcn Header */}
      <header className="border-b border-zinc-800/80 bg-black/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            {/* [TEMP] Logo Placeholder */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 select-none tracking-tight shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>[TEMP] LOGO</span>
            </div>
            <span className="hidden sm:inline text-zinc-800 font-light shrink-0">/</span>
            <div className="hidden md:flex items-center gap-1.5 hover:bg-zinc-900/60 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-transparent hover:border-zinc-800/40 shrink-0">
              <div className="w-4 h-4 rounded-md bg-zinc-850 border border-zinc-750 text-[10px] font-bold flex items-center justify-center text-zinc-300">K</div>
              <span className="text-sm font-semibold text-zinc-350">kaju-open-source</span>
            </div>
            <span className="hidden md:inline text-zinc-800 font-light shrink-0">/</span>
            <div className="flex items-center gap-1 hover:bg-zinc-900/60 px-2 md:px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-transparent hover:border-zinc-800/40 min-w-0">
              <span className="text-sm font-bold text-white tracking-wide truncate">ore-repository</span>
              <span className="text-[10px] border border-zinc-800 bg-zinc-900 text-zinc-500 px-1.5 py-0.2 rounded font-mono shrink-0">v0.1.0</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3.5 shrink-0">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm">
              {backendStatus === "online" ? (
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-bold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  API Live
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-555 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  Local Simulation
                </div>
              )}
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              className="bg-zinc-100 hover:bg-zinc-300 text-black text-sm font-bold px-2.5 sm:px-3 py-1.5 rounded-md cursor-pointer transition-all border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Upload PDF</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-4 md:gap-6 text-xs md:text-sm tracking-wide uppercase font-semibold overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
              { id: "overview", label: "Overview", icon: Layers },
              { id: "documents", label: "Ingestions", icon: FileText },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: SettingsIcon }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "overview" | "documents" | "analytics" | "settings")}
                  className={`py-3.5 border-b-2 flex items-center gap-1.5 font-bold transition-all relative cursor-pointer shrink-0 ${
                    isActive
                      ? "border-zinc-200 text-zinc-100"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* 📦 Main Page Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 z-10">

        {/* ==================== ⚡ OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-350">
            
            {/* Top Metric Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Total Chunks", value: documents.reduce((acc, d) => acc + (d.chunksCount || 0), 0), sub: "Recursive splitting", icon: Database },
                { title: "Indexed Characters", value: formatNumber(documents.reduce((acc, d) => acc + (d.charCount || 0), 0)), sub: "Text elements loaded", icon: FileText },
                { title: "Embedding Model", value: embedModel, sub: "768-dimension vectors", icon: Cpu },
                { title: "Retrieval Latency", value: "85 ms", sub: "Cosine proximity limit", icon: Activity }
              ].map((metric, idx) => {
                const Icon = metric.icon
                return (
                  <div key={idx} className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/60 transition-all group">
                    <div className="flex items-center justify-between text-sm text-zinc-450 font-bold uppercase tracking-wider">
                      <span>{metric.title}</span>
                      <div className="p-1 rounded bg-zinc-900 border border-zinc-850 group-hover:border-zinc-800/60 transition-all text-zinc-450">
                        <Icon className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="mt-3.5">
                      <div className="text-3xl font-bold tracking-tight text-white font-mono">{metric.value}</div>
                      <div className="text-sm text-zinc-500 mt-1.5">{metric.sub}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Split Panel: Chat Console (Left) and Active State Detail (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Chat Console Box */}
              <div className="lg:col-span-2 border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md flex flex-col min-h-[450px] h-[500px] md:h-[600px] overflow-hidden shadow-xl">
                {/* Chat Header */}
                <div className="px-4 md:px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/20 backdrop-blur-sm shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Semantic Query Console</span>
                  </div>
                  <div className="text-[10px] md:text-xs border border-zinc-800 bg-zinc-900/60 text-zinc-450 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Indexed base
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 md:space-y-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 md:gap-4">
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-md border text-[10px] font-bold flex items-center justify-center shrink-0 tracking-wider shadow-sm ${
                        msg.role === "user" 
                          ? "bg-zinc-900 border-zinc-800 text-zinc-400" 
                          : "bg-white border-zinc-900 text-black font-extrabold"
                      }`}>
                        {msg.role === "user" ? "USR" : "AI"}
                      </div>

                      {/* Content */}
                      <div className="space-y-2.5 max-w-[90%] md:max-w-[85%]">
                        <div className={`p-3 md:p-4 rounded-xl text-sm md:text-[16px] leading-relaxed tracking-wide whitespace-pre-wrap border ${
                          msg.role === "user" 
                            ? "bg-zinc-900/30 text-zinc-100 border-zinc-850" 
                            : "bg-black/40 text-zinc-200 border-zinc-850"
                        }`}>
                          {msg.content}
                        </div>

                        {/* Citation tag badges */}
                        {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1.5">
                            <span className="text-[11px] uppercase tracking-wider text-zinc-555 font-bold flex items-center gap-1 mr-1">
                              <BookOpen className="w-3.5 h-3.5 text-zinc-555" /> Citations:
                            </span>
                            {msg.citations.map((citation, index) => (
                              <button
                                key={index}
                                onClick={() => setActiveCitation(citation)}
                                className="text-xs bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer font-mono"
                              >
                                <span>{citation.sourceName}</span>
                                <span className="text-zinc-650">[p. {citation.pageNumber}]</span>
                                <span className="text-emerald-450 font-semibold">{Math.round(citation.score * 100)}%</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-4 animate-pulse">
                      <div className="w-8 h-8 rounded-md bg-white border border-zinc-900 text-black flex items-center justify-center shrink-0 font-bold text-[10px]">
                        AI
                      </div>
                      <div className="bg-black/20 border border-zinc-850 rounded-xl p-4 text-zinc-555 text-sm font-mono">
                        Retrieving embeddings & creating completions...
                      </div>
                    </div>
                  )}

                  {/* Show floaters on welcome screen */}
                  {messages.length === 1 && !isTyping && (
                    <div className="py-4 space-y-4">
                      <div className="text-xs font-bold text-zinc-555 uppercase tracking-wider">Suggested queries</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {SAMPLE_QUESTIONS.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuery(question)}
                            className="p-3 md:p-3.5 text-left text-xs md:text-sm bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-850 hover:border-zinc-750 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer group flex items-start gap-2.5 shadow-sm"
                          >
                            <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 md:truncate">{question}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Footer */}
                <div className="p-3 md:p-4 border-t border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleQuery(inputVal)
                    }}
                    className="relative flex items-center max-w-4xl mx-auto"
                  >
                    <Input
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder={
                        documents.some((d) => d.status === "ready")
                          ? "Query indexed repository..."
                          : "Upload a PDF document first..."
                      }
                      disabled={!documents.some((d) => d.status === "ready") || isTyping}
                      className="pr-12 py-5 bg-black/60 border-zinc-800 focus-visible:ring-zinc-800/40 text-zinc-100 placeholder:text-zinc-650 rounded-lg text-sm"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputVal.trim() || isTyping}
                      className="absolute right-2 text-black bg-zinc-100 hover:bg-zinc-300 disabled:bg-zinc-900 disabled:text-zinc-650 rounded w-7 h-7 cursor-pointer border border-transparent shadow"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </form>
                  <div className="flex items-center justify-between text-xs text-zinc-555 mt-2 px-1 font-mono">
                    <span>Press Enter to submit</span>
                    <span>Distance similarity: Cosine</span>
                  </div>
                </div>
              </div>

              {/* Right Column: RAG Ingest Pipeline Diagram and Metadata */}
              <div className="space-y-6">
                          {/* Active Ingest Context card */}
                <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between text-sm text-white font-bold border-b border-zinc-800 pb-2.5">
                    <span>Active Context</span>
                    <span className="text-xs text-zinc-500 font-mono">production</span>
                  </div>

                  {documents.length === 0 ? (
                    <p className="text-sm text-zinc-500">No documents indexed in vector storage.</p>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span className="text-sm text-white truncate font-medium">{documents[0].name}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-850/80">
                          <div className="text-[11px] text-zinc-550 font-bold uppercase tracking-wider">Chunks Count</div>
                          <div className="text-base font-bold text-white font-mono mt-1">{documents[0].chunksCount || "--"}</div>
                        </div>
                        <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-850/80">
                          <div className="text-[11px] text-zinc-555 font-bold uppercase tracking-wider">File Size</div>
                          <div className="text-base font-bold text-white font-mono mt-1">{documents[0].size}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pipeline Flow Diagram */}
                <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md p-5 space-y-4 shadow-lg">
                  <div className="text-sm text-white font-bold">RAG Ingestion Pipeline</div>
                  <div className="space-y-4 relative pl-4 border-l border-zinc-800 text-xs text-zinc-400">
                    {[
                      { step: "1. Raw Document Ingestion", tool: "PyMuPDF parsing layout", active: true },
                      { step: "2. Document Chunking", tool: "LangChain Character Splitter", active: true },
                      { step: "3. Vector Representation", tool: "Ollama Embeddings API", active: true },
                      { step: "4. Semantic Persistence", tool: "SQLite/ChromaDB context search", active: true }
                    ].map((step, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute -left-[20px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-200 border border-black z-10 group-hover:bg-white transition-all" />
                        <div className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{step.step}</div>
                        <div className="text-[11px] text-zinc-550">{step.tool}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ⚡ DOCUMENTS TAB ==================== */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-in fade-in duration-350">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Ingestion History</h3>
                <p className="text-sm text-zinc-550">Historical document indexing runs styled like Vercel deployments.</p>
              </div>
            </div>
                      {/* Document deployments table (Desktop) */}
            <div className="hidden md:block border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/30 text-zinc-500 font-bold uppercase tracking-wider text-xs">
                    <th className="p-4">Document</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Environment</th>
                    <th className="p-4">Total Chunks</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/60">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-650 font-bold">No ingestions found.</td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-4 font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-555 shrink-0" />
                          <span className="truncate max-w-[200px]" title={doc.name}>{doc.name}</span>
                        </td>
                        <td className="p-4">
                          {doc.status === "ready" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                              <span className="w-1 h-1 rounded-full bg-emerald-450 shadow-[0_0_6px_rgba(52,211,153,0.6)]" /> Ready
                            </span>
                          )}
                          {doc.status === "failed" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" /> Failed
                            </span>
                          )}
                          {doc.status !== "ready" && doc.status !== "failed" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" /> {doc.status}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-zinc-555 font-medium">{doc.created}</td>
                        <td className="p-4">
                          <span className="text-[10px] border border-zinc-800 bg-zinc-900 text-zinc-450 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold">
                            {doc.environment}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-zinc-350">{doc.chunksCount ?? "--"}</td>
                        <td className="p-4 text-right flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setViewingLogsDoc(doc)}
                            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 font-bold cursor-pointer hover:text-white"
                          >
                            <TerminalIcon className="w-3 h-3 text-zinc-400" /> Logs
                          </button>
                          <button
                            onClick={(e) => deleteDocument(doc.id, e)}
                            className="p-1 text-zinc-550 hover:text-red-400 hover:bg-red-500/5 rounded transition-all cursor-pointer"
                            title="Remove document index"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Document deployments cards (Mobile) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {documents.length === 0 ? (
                <div className="p-8 text-center border border-zinc-800/80 rounded-xl bg-zinc-950/40 text-zinc-650 font-bold">
                  No ingestions found.
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md p-4 space-y-4 shadow-md hover:border-zinc-700/60 transition-all">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-zinc-555 shrink-0" />
                        <span className="font-semibold text-white text-sm truncate" title={doc.name}>{doc.name}</span>
                      </div>
                      <button
                        onClick={(e) => deleteDocument(doc.id, e)}
                        className="p-1 text-zinc-550 hover:text-red-400 hover:bg-red-500/5 rounded transition-all cursor-pointer shrink-0"
                        title="Remove document index"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-zinc-555 block font-bold uppercase tracking-wider text-[10px]">Status</span>
                        <div className="mt-1">
                          {doc.status === "ready" && (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wide">
                              <span className="w-1 h-1 rounded-full bg-emerald-450 shadow-[0_0_6px_rgba(52,211,153,0.6)]" /> Ready
                            </span>
                          )}
                          {doc.status === "failed" && (
                            <span className="inline-flex items-center gap-1 text-red-500 font-bold uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" /> Failed
                            </span>
                          )}
                          {doc.status !== "ready" && doc.status !== "failed" && (
                            <span className="inline-flex items-center gap-1 text-amber-500 font-bold uppercase tracking-wide animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" /> {doc.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-555 block font-bold uppercase tracking-wider text-[10px]">Chunks</span>
                        <span className="font-mono text-zinc-300 block mt-1">{doc.chunksCount ?? "--"}</span>
                      </div>

                      <div>
                        <span className="text-zinc-555 block font-bold uppercase tracking-wider text-[10px]">Created</span>
                        <span className="text-zinc-350 block mt-1">{doc.created}</span>
                      </div>

                      <div>
                        <span className="text-zinc-555 block font-bold uppercase tracking-wider text-[10px]">Environment</span>
                        <span className="inline-block mt-1 text-[9px] border border-zinc-800 bg-zinc-900 text-zinc-450 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider font-bold">
                          {doc.environment}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-850/60">
                      <button
                        onClick={() => setViewingLogsDoc(doc)}
                        className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 font-bold cursor-pointer hover:text-white"
                      >
                        <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" /> View Pipeline Logs
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Simulated terminal logs box if clicked */}
            {viewingLogsDoc && (
              <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/60 backdrop-blur-md overflow-hidden flex flex-col h-80 animate-in slide-in-from-bottom duration-350 shadow-2xl">
                <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <TerminalIcon className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                    <span className="text-xs md:text-sm text-white font-bold font-mono truncate">Log: {viewingLogsDoc.name}</span>
                  </div>
                  <button
                    onClick={() => setViewingLogsDoc(null)}
                    className="text-zinc-500 hover:text-zinc-300 text-xs md:text-sm font-bold font-mono cursor-pointer shrink-0"
                  >
                    Close
                  </button>
                </div>
                <div className="flex-1 bg-black p-3.5 md:p-4 overflow-y-auto font-mono text-[13px] md:text-[15px] text-zinc-300 space-y-2 md:space-y-2.5 scrollbar-thin tracking-tight leading-relaxed">
                  {viewingLogsDoc.logs.map((log, index) => (
                    <div key={index} className="flex gap-3 md:gap-4">
                      <span className="text-zinc-650 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className={`shrink-0 font-bold select-none ${
                        log.level === "ERROR" ? "text-red-500" : log.level === "WARNING" ? "text-amber-500" : "text-emerald-400"
                      }`}>
                        {log.level === "INFO" ? "SUCCESS" : log.level}
                      </span>
                      <span className="text-zinc-200">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== ⚡ ANALYTICS TAB ==================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-350">
            <div>
              <h3 className="text-lg font-bold text-white">Search Analytics</h3>
              <p className="text-sm text-zinc-555">Monitor query execution speed and semantic relevance metrics.</p>
            </div>

            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Avg Query Latency Card */}
              <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md p-5 space-y-4 shadow-lg hover:border-zinc-700/60 transition-all">
                <div className="flex items-center justify-between text-xs text-zinc-555 font-bold uppercase tracking-wider">
                  <span>Query Latency</span>
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="text-4xl font-bold text-white font-mono">85 ms</div>
                <div className="w-full bg-zinc-950/45 h-10 rounded overflow-hidden flex items-end gap-0.5 border border-zinc-850 p-1">
                  {[4, 6, 8, 3, 5, 7, 9, 4, 3, 6, 8, 5, 4, 6, 7, 9, 3, 5, 8, 6].map((h, i) => (
                    <div key={i} className="flex-1 bg-zinc-200 hover:bg-white transition-colors rounded-t-[1px]" style={{ height: `${h * 10}%` }} title={`Latency: ${h * 10}ms`} />
                  ))}
                </div>
                <p className="text-xs text-zinc-500">Avg execution time across RAG retrieves.</p>
              </div>

              {/* Retrieval Accuracy Card */}
              <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md p-5 space-y-4 shadow-lg hover:border-zinc-700/60 transition-all">
                <div className="flex items-center justify-between text-xs text-zinc-555 font-bold uppercase tracking-wider">
                  <span>Retrieval Recall</span>
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-4xl font-bold text-white font-mono">98.4%</div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-zinc-500 font-medium">
                    <span>Target Boundary</span>
                    <span>95.0%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: "98.4%" }} />
                  </div>
                </div>
                <p className="text-xs text-zinc-550">Semantic recall similarity match percentage.</p>
              </div>

              {/* Chunk Density Card */}
              <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md p-5 space-y-4 shadow-lg hover:border-zinc-700/60 transition-all">
                <div className="flex items-center justify-between text-xs text-zinc-555 font-bold uppercase tracking-wider">
                  <span>Indexed Database Volume</span>
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="text-4xl font-bold text-white font-mono">
                  {documents.reduce((acc, d) => acc + (d.chunksCount || 0), 0)} Chunks
                </div>
                <div className="space-y-2 pt-1.5 text-xs text-zinc-400">
                  <div className="flex justify-between border-b border-zinc-850/60 py-1">
                    <span className="text-zinc-550">Index Algorithm</span>
                    <span className="font-mono text-zinc-300">HNSW SQLite-based</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-550">Vector Dimension</span>
                    <span className="font-mono text-zinc-300">768 dimensions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ⚡ SETTINGS TAB ==================== */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in duration-350">
            <div>
              <h3 className="text-xl font-bold text-white">Repository Settings</h3>
              <p className="text-sm text-zinc-550">Fine-tune chunk boundaries and local embedding models.</p>
            </div>

            {/* Settings Card: Chunk Boundaries */}
            <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-lg">
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-base font-semibold text-white">Text Splitter Parameters</h4>
                  <p className="text-sm text-zinc-500 mt-1">Configure chunk sizes and overlapping ranges used by the Langchain character splitter.</p>
                </div>

                <div className="space-y-5 max-w-xl">
                  {/* Chunk Size */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-zinc-300 font-medium">
                      <span>Chunk Size (chars)</span>
                      <span className="font-mono text-white font-bold">{chunkSize} chars</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="1500"
                      step="50"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(Number(e.target.value))}
                      className="w-full accent-white cursor-pointer bg-zinc-900 rounded-lg appearance-none h-1"
                    />
                  </div>

                  {/* Chunk Overlap */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-zinc-300 font-medium">
                      <span>Chunk Overlap (chars)</span>
                      <span className="font-mono text-white font-bold">{chunkOverlap} chars</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(Number(e.target.value))}
                      className="w-full accent-white cursor-pointer bg-zinc-900 rounded-lg appearance-none h-1"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-3.5 bg-zinc-900/30 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-550 font-mono">
                <span>Applied on next ingestion cycle</span>
                <Button size="sm" className="bg-zinc-100 hover:bg-zinc-300 text-black text-sm font-bold px-3 py-1 rounded cursor-pointer transition-all">
                  Save Split Rules
                </Button>
              </div>
            </div>

            {/* Settings Card: Embedding Model Config */}
            <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-lg">
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-base font-semibold text-white">Active Embedding Model</h4>
                  <p className="text-sm text-zinc-500 mt-1">Select the semantic model utilized by Ollama to convert chunks into floating-point vectors.</p>
                </div>

                <div className="max-w-md">
                  <select
                    value={embedModel}
                    onChange={(e) => setEmbedModel(e.target.value)}
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-zinc-350 outline-none focus:border-zinc-500 cursor-pointer font-medium"
                  >
                    <option value="nomic-embed-text">nomic-embed-text (768-dim, Default)</option>
                    <option value="bge-large-en-v1.5">bge-large-en-v1.5 (1024-dim, High Precision)</option>
                    <option value="all-minilm">all-minilm (384-dim, Ultra Fast)</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-3.5 bg-zinc-900/30 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-555 font-mono">
                <span>Must pull locally first (`ollama pull &lt;model&gt;`).</span>
                <Button size="sm" className="bg-zinc-100 hover:bg-zinc-300 text-black text-sm font-bold px-3 py-1 rounded cursor-pointer transition-all">
                  Pull & Load
                </Button>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* 📑 Sidebar Drawer Overlay: Selected Citation Context Viewer */}
      {activeCitation && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-zinc-950 border-l border-zinc-800 shadow-2xl p-6 z-50 flex flex-col text-zinc-100 transition-all duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Source segment</h3>
            </div>
            <button
              onClick={() => setActiveCitation(null)}
              className="text-zinc-500 hover:text-white text-sm font-bold font-mono hover:bg-zinc-900 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-555 tracking-wider">Document</label>
              <div className="text-sm text-zinc-200 bg-zinc-900/40 p-3 rounded border border-zinc-850 truncate font-semibold">
                {activeCitation.sourceName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/40 p-3 rounded border border-zinc-850">
                <span className="text-xs uppercase font-bold text-zinc-555 tracking-wider">Page Reference</span>
                <p className="text-sm font-bold text-zinc-100 font-mono mt-1">Page {activeCitation.pageNumber}</p>
              </div>
              <div className="bg-zinc-900/40 p-3 rounded border border-zinc-850">
                <span className="text-xs uppercase font-bold text-zinc-555 tracking-wider">Similarity Score</span>
                <p className="text-sm font-bold text-emerald-450 font-mono mt-1">{Math.round(activeCitation.score * 100)}% Match</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-zinc-555 tracking-wider">Segment text snippet</label>
              <div className="text-sm leading-relaxed text-zinc-300 bg-zinc-900/20 p-4 rounded border border-zinc-850 italic font-mono leading-relaxed">
                &quot;{activeCitation.snippet}&quot;
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-850 text-center">
            <p className="text-xs text-zinc-650 flex items-center justify-center gap-1 font-mono">
              <span>Vector Similarity calculation</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
