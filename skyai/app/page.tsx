"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { SearchForm } from "@/components/search/SearchForm";
import { ChatBot } from "@/components/ai/ChatBot";
import {
  Sparkles,
  TrendingDown,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Star,
  ArrowRight,
  Plane,
  Users,
} from "lucide-react";
import Link from "next/link";

const DESTINATIONS = [
  { city: "Miami", country: "EE.UU.", price: 285, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", flag: "🇺🇸" },
  { city: "Madrid", country: "España", price: 520, image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600", flag: "🇪🇸" },
  { city: "Cancún", country: "México", price: 180, image: "https://images.unsplash.com/photo-1569949380983-b6e7b3a77a1a?w=600", flag: "🇲🇽" },
  { city: "París", country: "Francia", price: 680, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600", flag: "🇫🇷" },
  { city: "Tokio", country: "Japón", price: 950, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600", flag: "🇯🇵" },
  { city: "Dubái", country: "UAE", price: 720, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600", flag: "🇦🇪" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Predicción de Precios con IA",
    desc: "Nuestra inteligencia artificial analiza millones de datos históricos para predecir cuándo es el mejor momento para comprar tu vuelo y ahorrar hasta un 40%.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "Búsqueda Global en Tiempo Real",
    desc: "Comparamos cientos de aerolíneas y agencias en segundos. Siempre encuentras el mejor precio disponible en cualquier ruta del mundo.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Asistente IA 24/7",
    desc: "SkyBot, nuestro chatbot con GPT-4, resuelve todas tus dudas de viaje, recomienda destinos y te ayuda a planificar el viaje perfecto.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Alertas de Precio Inteligentes",
    desc: "Configura alertas y te notificamos cuando el precio de tu vuelo baje. Nunca más te perderás una oferta.",
    color: "from-green-500 to-teal-500",
  },
];

const STATS = [
  { value: "500M+", label: "Vuelos comparados", icon: Plane },
  { value: "195", label: "Países cubiertos", icon: Globe },
  { value: "40%", label: "Ahorro promedio con IA", icon: TrendingDown },
  { value: "4.9★", label: "Calificación usuarios", icon: Star },
];

export default function HomePage() {
  return (
    <div className="min-h-screen hero-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: "600px",
              height: "600px",
              background: "radial-gradient(circle, #3d7eff, transparent)",
              top: "-100px",
              right: "10%",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl opacity-10"
            style={{
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, #7c3aed, transparent)",
              bottom: "0",
              left: "5%",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 text-sm text-blue-400 mb-6">
              <Sparkles size={14} />
              Predicción de precios con Inteligencia Artificial
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Viaja Más.
              <br />
              <span className="gradient-text">Paga Menos.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              La primera plataforma de vuelos con IA que predice cuándo comprar para ahorrarte hasta{" "}
              <span className="text-cyan-400 font-semibold">40% en cada viaje</span>.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SearchForm />
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="glass rounded-xl p-4 text-center border border-blue-500/10">
                <Icon size={18} className="mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-bold gradient-text">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Destinos Populares
              </h2>
              <p className="text-slate-400 text-sm mt-1">Precios más bajos encontrados esta semana</p>
            </div>
            <Link href="/results?origin=BOG&destination=MIA&tripType=roundtrip" className="btn-secondary text-sm">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
              >
                <Link href={`/results?destination=${dest.city}&tripType=roundtrip`}>
                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dest.image}
                      alt={dest.city}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm">{dest.flag} {dest.city}</p>
                      <p className="text-slate-300 text-xs">{dest.country}</p>
                    </div>
                    <div className="absolute top-3 right-3 glass rounded-lg px-2 py-1 text-xs font-bold text-white">
                      desde ${dest.price}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Por qué elegir{" "}
              <span className="gradient-text">SkyAI</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              No somos solo un comparador de vuelos. Somos tu co-piloto inteligente para ahorrar en cada viaje.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 flex gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-center"
            style={{ background: "linear-gradient(135deg, rgba(61,126,255,0.15), rgba(124,58,237,0.15))", border: "1px solid rgba(61,126,255,0.2)" }}
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 -top-10 -left-10" style={{ background: "#3d7eff" }} />
              <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 -bottom-10 -right-10" style={{ background: "#7c3aed" }} />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm mb-6">
                <Zap size={14} /> Nuevo: Alertas de precio con IA
              </div>

              <h2
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Activa tu alerta gratuita
              </h2>

              <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                Dinos a dónde quieres viajar y te avisamos cuando el precio baje al nivel perfecto. Nuestra IA monitorea los precios 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login" className="btn-primary px-8 py-3.5 text-base">
                  <Users size={18} />
                  Crear cuenta gratis
                </Link>
                <Link href="/results" className="btn-secondary px-8 py-3.5 text-base">
                  Explorar vuelos
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Plane size={14} className="text-white" />
              </div>
              <span className="font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                SkyAI
              </span>
            </div>
            <p className="text-xs text-slate-500 text-center">
              © 2026 SkyAI. Precios en tiempo real. La predicción de precios es una estimación basada en datos históricos.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Términos</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
