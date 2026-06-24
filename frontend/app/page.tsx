"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [markdownText, setMarkdownText] = useState("");
  
  // Empty array representing zero files on a fresh user registration
  const [vaultFiles, setVaultFiles] = useState([]);
  
  // Clean initialization message
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Welcome to ORE Workspace. I am your local AI node. Type a prompt here or drop a file in your notes vault to get started." }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: chatInput }]);
    setChatInput("");
    setIsChatExpanded(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Local index offline node processing context. To run deep cross-reference inquiries, please drop or select a document in your Notes Vault." }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative min-h-[calc(100vh-10rem)]">
      
      {/* Title Header Section */}
      <div className="flex flex-col space-y-1 border-b border-[#1f1f23] pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Dashboard Console</h1>
        <p className="text-xs text-zinc-400">Integrated Markdown repository workbench paired with local model acceleration engines.</p>
      </div>

      {/* WORKSPACE SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COMPONENT: Live Markdown Editor Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-pink-500">📝</span>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">Live Markdown Editor</h3>
              </div>
              <span className="text-[10px] bg-zinc-800/30 text-zinc-400 border border-[#1f1f23] px-2 py-0.5 rounded font-mono">
                {markdownText ? "untitled.md*" : "empty_buffer"}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-96">
              <textarea 
                value={markdownText}
                onChange={(e) => setMarkdownText(e.target.value)}
                placeholder="# Start typing your new notes here...&#10;&#10;Use markdown syntax like ## for headers, **text** for bolding, or lists."
                className="w-full h-full p-4 rounded-lg bg-[#09090b] border border-[#1f1f23] text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-pink-500/50 resize-none leading-relaxed transition-colors"
              />
              <div className="w-full h-full p-4 rounded-lg bg-[#111114] border border-[#1f1f23] text-xs overflow-y-auto space-y-2 prose prose-invert select-none custom-scrollbar">
                {markdownText ? (
                  <div className="text-zinc-300 break-words whitespace-pre-wrap">{markdownText}</div>
                ) : (
                  <div className="text-zinc-600 italic text-xs flex items-center justify-center h-full">
                    Live compiled Markdown preview will display here...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: Clean Vault Explorer Placeholder */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-pink-500">📂</span>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">Vault Explorer</h3>
              </div>
            </div>
            
            {vaultFiles.length > 0 ? (
              <div className="space-y-1.5">
                {vaultFiles.map((doc: any) => (
                  <div key={doc.title} className="p-2.5 rounded-lg border border-[#1f1f23] bg-[#09090b] flex items-center justify-between group">
                    <span className="text-xs text-zinc-300 truncate">{doc.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* High-End Clean Empty Workspace State Placeholders */
              <div className="py-12 px-4 rounded-lg border border-dashed border-[#27272a] bg-[#09090b]/50 text-center flex flex-col items-center justify-center">
                <span className="text-xl mb-2 opacity-40">📥</span>
                <h4 className="text-xs font-bold text-zinc-300">No active knowledge sources</h4>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-[180px] leading-normal mx-auto">Your indexed markdown workspace and documents will show up here.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🤖 FIXED COLLAPSIBLE BOTTOM-RIGHT CHAT DOCK */}
      <div className={`fixed bottom-0 right-6 z-50 w-80 md:w-96 rounded-t-xl border border-[#2d2d33] bg-[#0c0c0e] shadow-2xl transition-all duration-300 ease-in-out ${
        isChatExpanded ? "h-[440px]" : "h-14"
      }`}>
        <div 
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          className="h-14 px-4 flex items-center justify-between border-b border-[#1f1f23] cursor-pointer hover:bg-[#121214] rounded-t-xl select-none"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
            </span>
            <span className="text-[11px] font-bold text-white tracking-wider uppercase font-mono">ORE Local AI Node</span>
          </div>
          <button className="text-zinc-500 hover:text-white text-xs transition-colors font-medium">
            {isChatExpanded ? "▼ Minimize" : "▲ Expand View"}
          </button>
        </div>

        <div className="p-4 h-[315px] overflow-y-auto flex flex-col space-y-3 bg-[#09090b] custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.sender === "user" ? "bg-pink-600 text-white font-semibold shadow-sm border border-pink-500/20" : "bg-[#141417] text-zinc-300 border border-[#1f1f23]"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="absolute bottom-0 w-full h-14 border-t border-[#1f1f23] flex items-center bg-[#0c0c0e] px-3 gap-2">
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => setIsChatExpanded(true)}
            placeholder="Query your offline vault node..."
            className="flex-1 bg-[#141416] border border-[#1f1f23] rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/40"
          />
          <button type="submit" className="bg-pink-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-md hover:bg-pink-500 transition-colors shadow-sm">
            Send
          </button>
        </form>
      </div>

    </div>
  );
}