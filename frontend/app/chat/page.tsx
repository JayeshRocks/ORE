"use client";

import { useState } from "react";

export default function AIChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  
  // Track if a user has uploaded/selected a document to process
  const [activeDocument, setActiveDocument] = useState<string | null>(null);

  const handleSend = (textToSend: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message to layout frame
    setMessages(prev => [...prev, { text, isAi: false }]);
    if (!textToSend) setInput("");

    // Simulate backend intelligence delivery loop
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: activeDocument 
          ? `Grounded analysis complete for context source [${activeDocument}]: The model engine indicates target operational patterns match engineering specs.`
          : "System Prompt: I am operating in standard fallback mode. Please drag or upload a document index structure to ground my knowledge graph vectors.", 
        isAi: true 
      }]);
    }, 600);
  };

  // Quick helper to simulate uploading a file during testing
  const mockUploadAction = () => {
    setActiveDocument("research-paper.pdf");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-[calc(100vh-7rem)] flex flex-col">
      
      <div className="flex items-center justify-between border-b border-[#1f1f23] pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Interrogate Knowledge Vault</h1>
          <p className="text-xs text-zinc-400">Ground your prompt scopes into localized materials with deep source synthesis.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 items-stretch">
        
        {/* LEFT COLUMN: ACTIVE FILE ATTACHMENT HUB */}
        <div className="w-64 shrink-0 flex flex-col space-y-4">
          <div className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] p-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2 mb-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Documents</h3>
            </div>
            
            {activeDocument ? (
              <div className="rounded-lg p-3 border border-pink-500/40 bg-pink-500/[0.03] flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 truncate">{activeDocument}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">24 pages · Ready</div>
                </div>
                <button 
                  onClick={() => setActiveDocument(null)}
                  className="text-zinc-600 hover:text-zinc-400 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              /* First-time drop placeholder zone frame */
              <div 
                onClick={mockUploadAction}
                className="flex-1 border border-dashed border-[#27272a] hover:border-pink-500/30 bg-[#09090b]/40 rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
              >
                <span className="text-lg opacity-40 group-hover:scale-110 transition-transform duration-200">📎</span>
                <div className="text-xs font-bold text-zinc-400 mt-2 group-hover:text-zinc-200">Upload Source</div>
                <p className="text-[9px] text-zinc-600 mt-1 max-w-[140px] leading-normal">Click to browse or drop PDF/Markdown documents into processing terminal.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: COMPLETE STREAM STREAM CHAT BOX */}
        <div className="flex-1 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] flex flex-col min-h-0 overflow-hidden shadow-md">
          
          <div className="p-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0e0e11] shrink-0">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${activeDocument ? "bg-pink-500 animate-pulse" : "bg-zinc-700"}`} />
              <span className="text-xs font-bold text-zinc-200 tracking-wide">Context Stream</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Grounded Prompt Engine</span>
          </div>

          {/* Messages Output Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#09090b]/40 custom-scrollbar">
            {messages.length > 0 ? (
              messages.map((msg: any, i) => (
                <div key={i} className={`flex ${msg.isAi ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] text-xs leading-relaxed px-4 py-3 rounded-xl border transition-all ${
                    msg.isAi 
                      ? "bg-[#0c0c0e]/90 border-[#1f1f23] text-zinc-300" 
                      : "bg-pink-500/10 border-pink-500/20 text-zinc-100"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            ) : (
              /* Empty message logs greeting display fallback layout */
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <span className="text-2xl mb-2">💬</span>
                <p className="text-xs font-medium text-zinc-400">Knowledge stream idle.</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Send a chat prompt message below to invoke execution pipelines.</p>
              </div>
            )}
          </div>

          {/* Prompt Entry & Chips Layout footer */}
          <div className="p-4 border-t border-[#1f1f23] bg-[#0c0c0e] space-y-3 shrink-0">
            
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-w-full">
              {[
                "Summarize key findings",
                "Explain the methodology",
                "Extract core formulas"
              ].map((chip) => (
                <button 
                  key={chip}
                  disabled={!activeDocument}
                  onClick={() => handleSend(chip)}
                  className="text-[10px] text-zinc-400 bg-[#09090b] border border-[#1f1f23] px-3 py-1 rounded-full hover:border-pink-500/40 hover:text-white transition-all whitespace-nowrap disabled:opacity-40 disabled:hover:border-[#1f1f23] disabled:hover:text-zinc-400"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#09090b] border border-[#1f1f23] rounded-lg p-1.5 gap-2 focus-within:border-pink-500/40 transition-colors">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeDocument ? "Ask the document anything..." : "Please link a document index parameter to begin probing..."}
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-700 focus:outline-none px-2"
                onKeyDown={(e) => e.key === "Enter" && handleSend("")}
              />
              <button 
                onClick={() => handleSend("")}
                className="h-7 w-7 rounded-md bg-pink-600 hover:bg-pink-500 transition-colors flex items-center justify-center text-white shrink-0 shadow-sm"
              >
                ➔
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}