"use client";

import { useState } from "react";

export default function NotesWorkspacePage() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Empty array initialized representing a pristine launch account setup
  const [notesList, setNotesList] = useState([]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Panel Option */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#1f1f23] pb-5 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Notes Vault Workspace</h1>
          <p className="text-xs text-zinc-400">Manage, organize, and stream markdown intelligence vectors.</p>
        </div>
        <button 
          onClick={() => setNotesList([{ title: "untitled_document.md", words: "0 words", date: "Created just now", size: "0.1 KB" }] as any)}
          className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs px-4 py-2 rounded-md transition-all shadow-sm shrink-0"
        >
          + Create New Note
        </button>
      </div>

      {/* Categories Horizontal Tabs bar strip */}
      <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-px text-xs">
        {["all", "markdown", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 font-medium capitalize transition-all ${
              activeTab === tab 
                ? "border-pink-500 text-white font-bold" 
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conditionally evaluating array counts */}
      {notesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notesList.map((note: any) => (
            <div key={note.title} className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] p-5 flex flex-col justify-between hover:border-pink-500/30 transition-all cursor-pointer group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base">📄</span>
                  <span className="text-[9px] bg-[#141416] border border-[#222226] px-2 py-0.5 rounded font-mono text-zinc-400">{note.size}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors truncate">{note.title}</h4>
                <p className="text-[11px] text-zinc-500 mt-1">{note.words}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#1f1f23] flex items-center justify-between text-[10px] text-zinc-500">
                <span>{note.date}</span>
                <span className="text-pink-500 font-bold">Open View ➔</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Squeaky clean empty vault landing fallback card placeholder segment */
        <div className="py-24 rounded-xl border border-dashed border-[#27272a] bg-[#0c0c0e]/40 text-center flex flex-col items-center justify-center max-w-xl mx-auto px-4 mt-4">
          <span className="text-3xl mb-3 opacity-30">📂</span>
          <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Your vault repository is completely empty</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm leading-relaxed">
            There are no documented indices saved inside your local node file tree matrix. Click the create button above to start your first working log.
          </p>
        </div>
      )}

    </div>
  );
}