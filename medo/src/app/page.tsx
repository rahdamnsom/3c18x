"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Activity, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon, Terminal, Hash, Eraser } from "lucide-react";

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: "info" | "success" | "error" | "warn" }[]>([]);
  const [accountCount, setAccountCount] = useState(10);
  const [inviteLink, setInviteLink] = useState("https://medo.dev/?invitecode=user-9mj2gtv04um8");
  const [mounted, setMounted] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (msg: string, type: "info" | "success" | "error" | "warn" = "info") => {
    setLogs((prev) => [...prev, { msg, type }].slice(-100));
  };

  const startAutomation = async () => {
    if (!inviteLink.includes("medo.dev")) {
      addLog("Invalid link.", "error");
      return;
    }
    setIsRunning(true);
    setLogs([]);
    addLog("Starting...", "info");

    try {
      const response = await fetch("/api/run-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: accountCount, inviteLink }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialLine = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split("\n");
        partialLine = lines.pop() || "";

        lines.forEach((line) => {
          const cleanLine = line.trim();
          if (!cleanLine) return;
          
          if (cleanLine.startsWith("LOG:")) {
            const parts = cleanLine.split(":");
            const type = parts[1].toLowerCase() as any;
            const msg = parts.slice(2).join(":");
            addLog(msg, type);
          } else {
            addLog(cleanLine, "info");
          }
        });
      }
    } catch (error) {
      addLog("Connection error", "error");
    } finally {
      setIsRunning(false);
      addLog("Done.", "info");
    }
  };

  if (!mounted) return null;

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-black text-white selection:bg-white/20">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/50 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="font-bold tracking-tight text-lg">MEDO <span className="text-neutral-500">SYNC</span></span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Activity size={12} /> Status: Online</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        
        {/* Left: Settings */}
        <section className="w-full lg:w-[360px] flex flex-col gap-4">
          <div className="flex-1 bg-neutral-900/30 rounded-2xl border border-white/5 p-6 flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Your Invite Link</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
                    <LinkIcon size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    placeholder="Paste link here..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-white/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Number of Accounts</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
                    <Hash size={16} />
                  </div>
                  <input 
                    type="number" 
                    value={accountCount}
                    onChange={(e) => setAccountCount(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-white/20 transition-all font-mono no-spinner"
                  />
                </div>
              </div>

              <button 
                onClick={startAutomation}
                disabled={isRunning}
                className="w-full h-14 bg-white text-black font-bold text-sm rounded-xl hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] motion-reduce:active:scale-100 flex items-center justify-center gap-3"
              >
                {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play size={18} fill="currentColor" />}
                {isRunning ? "Running..." : "Start"}
              </button>
            </div>
          </div>

          <div className="h-20 grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Success</span>
              <span className="text-xl font-mono">0</span>
            </div>
            <div className="bg-neutral-900/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Failed</span>
              <span className="text-xl font-mono">0</span>
            </div>
          </div>
        </section>

        {/* Right: Logs */}
        <section className="flex-1 flex flex-col bg-neutral-900/30 rounded-2xl border border-white/5 overflow-hidden relative">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-neutral-500" />
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Activity Log</span>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-500 hover:text-white"
              title="Clear Logs"
            >
              <Eraser size={14} />
            </button>
          </div>
          
          <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed overflow-y-auto custom-scrollbar bg-black/10">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-3 opacity-40">
                <Activity size={32} strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Waiting to start...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-1 duration-200 motion-reduce:animate-none">
                    <span className="text-neutral-600 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className={
                      log.type === "success" ? "text-white font-bold" : 
                      log.type === "error" ? "text-red-400" : 
                      log.type === "warn" ? "text-neutral-400 italic" : "text-neutral-300"
                    }>
                      {log.type === "success" && <CheckCircle2 className="inline w-3.5 h-3.5 mr-2 mb-0.5" />}
                      {log.type === "error" && <AlertCircle className="inline w-3.5 h-3.5 mr-2 mb-0.5" />}
                      {log.msg}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="px-8 py-4 border-t border-white/5 flex items-center justify-between text-neutral-600 text-[10px] font-bold uppercase tracking-widest">
        <span>&copy; 2026 Sync</span>
        <a href="https://fear.subeditor.works/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
          Made by Fear.sh
        </a>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        /* Hide number input spinners */
        .no-spinner::-webkit-inner-spin-button,
        .no-spinner::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
    </main>
  );
}
