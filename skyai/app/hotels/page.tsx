"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChatBot } from "@/components/ai/ChatBot";
import { SearchForm } from "@/components/search/SearchForm";
import { motion } from "framer-motion";
import { Star, MapPin, Wifi, Dumbbell, Coffee, Utensils, Waves, Sparkles, TrendingDown } from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  stars: number;
  rating: number;
  reviewCount: number;
  image: string;
  address: string;
  city: string;
  price: number;
  currency: string;
  amenities: string[];
  cancellation: string;
  deal: boolean;
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  pool: Waves,
  wifi: Wifi,
  gym: Dumbbell,
  breakfast: Coffee,
  restaurant: Utensils,
  spa: Sparkles,
};

function HotelsContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const city = searchParams.get("city") ?? "Miami";

  useEffect(() => {
    fetch(`/api/hotels?city=${city}`)
      .then((r) => r.json())
      .then((d) => setHotels(d.hotels ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />
      <div className="pt-20 border-b border-blue-500/10 pb-4 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto">
          <SearchForm />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Hoteles en <span className="gradient-text">{city}</span>
          </h1>
          <div className="badge badge-blue">
            <Sparkles size={10} /> {hotels.length} resultados
          </div>
        </div>

        {/* AI insight */}
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 border border-green-500/20" style={{ background: "rgba(16, 217, 143, 0.05)" }}>
          <TrendingDown size={18} className="text-green-400 flex-shrink-0" />
          <p className="text-sm text-slate-300">
            <span className="text-green-400 font-medium">SkyAI recomienda:</span> Esta semana los precios de hoteles en {city} están{" "}
            <span className="text-white font-medium">12% por debajo del promedio</span>. Buen momento para reservar.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="card h-80 shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, i) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {hotel.deal && (
                    <div className="absolute top-3 left-3 badge badge-green">
                      <TrendingDown size={10} /> Oferta
                    </div>
                  )}
                  <div className="absolute top-3 right-3 glass rounded-lg px-2 py-1 text-sm font-bold text-white">
                    ${hotel.price}/noche
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white text-sm leading-tight">{hotel.name}</h3>
                    <div className="flex text-yellow-400 flex-shrink-0 ml-2">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                    <MapPin size={11} />
                    {hotel.address}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-white">{hotel.rating}</span>
                    <div>
                      <div className="text-xs font-medium text-white">
                        {hotel.rating >= 9 ? "Excelente" : hotel.rating >= 8 ? "Muy bueno" : "Bueno"}
                      </div>
                      <div className="text-xs text-slate-400">{hotel.reviewCount.toLocaleString()} reseñas</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3 flex-wrap">
                    {hotel.amenities.slice(0, 4).map((amenity) => {
                      const Icon = AMENITY_ICONS[amenity] ?? Sparkles;
                      return (
                        <span key={amenity} className="flex items-center gap-1 text-xs text-slate-400">
                          <Icon size={11} className="text-blue-400" />
                          {amenity === "pool" ? "Piscina" : amenity === "wifi" ? "WiFi" : amenity === "gym" ? "Gimnasio" : amenity === "breakfast" ? "Desayuno" : amenity === "restaurant" ? "Restaurante" : "Spa"}
                        </span>
                      );
                    })}
                  </div>

                  <div className="text-xs text-green-400 mb-3">{hotel.cancellation}</div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-white">${hotel.price}</span>
                      <span className="text-xs text-slate-400"> /noche</span>
                    </div>
                    <button className="btn-primary text-xs py-2 px-4">Reservar</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--background)" }} />}>
      <HotelsContent />
    </Suspense>
  );
}
