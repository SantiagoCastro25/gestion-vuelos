"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ChatBot } from "@/components/ai/ChatBot";
import { Package, Sparkles } from "lucide-react";

export default function PackagesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />
      
      <div className="pt-32 flex flex-col items-center justify-center px-4">
        <div className="card p-12 max-w-lg w-full text-center border border-blue-500/20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <Package size={32} className="text-blue-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Paquetes de Viaje
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            Estamos entrenando a nuestra inteligencia artificial para crear los mejores paquetes combinados de Vuelo + Hotel + Actividades.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-sm font-medium">
            <Sparkles size={16} /> Próximamente en SkyAI
          </div>
        </div>
      </div>
      
      <ChatBot />
    </div>
  );
}
