"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ChatBot } from "@/components/ai/ChatBot";
import { motion } from "framer-motion";
import { User, Mail, Bell, Shield, MapPin, Edit, Settings } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <Navbar />
        <div className="pt-32 flex justify-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--background)" }}>
      <Navbar />
      
      <div className="pt-24 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Mi Perfil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="card p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "Usuario"}
                    fill
                    className="rounded-full object-cover border-4 border-blue-500/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg mx-auto border-4 border-blue-500/20">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg border-2 border-slate-900">
                  <Edit size={14} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{session.user?.name}</h2>
              <p className="text-sm text-slate-400 mb-4">{session.user?.email}</p>
              
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-500/10 text-cyan-400 font-medium transition-colors text-sm">
                  <User size={16} /> Información Personal
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-slate-300 font-medium transition-colors text-sm">
                  <Bell size={16} /> Alertas de Precio
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-slate-300 font-medium transition-colors text-sm">
                  <Shield size={16} /> Seguridad y Privacidad
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 text-slate-300 font-medium transition-colors text-sm">
                  <Settings size={16} /> Preferencias
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-400" />
                Datos Básicos
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Nombre Completo</label>
                    <input type="text" defaultValue={session.user?.name ?? ""} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Correo Electrónico</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="email" defaultValue={session.user?.email ?? ""} className="input-field pl-9" disabled />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Teléfono</label>
                    <input type="tel" placeholder="+1 (555) 000-0000" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Ubicación</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" placeholder="Ej: Bogotá, Colombia" className="input-field pl-9" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="btn-primary text-sm px-6">Guardar Cambios</button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings size={18} className="text-blue-400" />
                Preferencias de Viaje
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Aeropuerto de origen principal</label>
                  <input type="text" defaultValue="BOG - Bogotá El Dorado" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Clase de cabina preferida</label>
                  <select className="input-field" defaultValue="economy">
                    <option value="economy" className="bg-slate-800">Económica</option>
                    <option value="premium_economy" className="bg-slate-800">Premium Económica</option>
                    <option value="business" className="bg-slate-800">Business</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="btn-primary text-sm px-6">Guardar Preferencias</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
}
