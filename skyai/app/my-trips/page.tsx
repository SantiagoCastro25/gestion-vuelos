"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ChatBot } from "@/components/ai/ChatBot";
import { motion } from "framer-motion";
import { Plane, Calendar, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MyTripsPage() {
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

  const upcomingTrips = [
    {
      id: "trip-1",
      destination: "Miami",
      country: "EE.UU.",
      dates: "15 Jun 2026 - 20 Jun 2026",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      status: "Confirmado",
      type: "Vuelo + Hotel",
    }
  ];

  const savedTrips = [
    {
      id: "saved-1",
      destination: "Madrid",
      country: "España",
      price: "$520",
      image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800",
    },
    {
      id: "saved-2",
      destination: "Cancún",
      country: "México",
      price: "$180",
      image: "https://images.unsplash.com/photo-1569949380983-b6e7b3a77a1a?w=800",
    }
  ];

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--background)" }}>
      <Navbar />
      
      <div className="pt-24 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Mis Viajes
        </h1>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Plane className="text-blue-400" /> Próximos Viajes
          </h2>
          
          {upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card overflow-hidden group"
                >
                  <div className="relative h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-3 left-3 badge badge-green">
                      {trip.status}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1">{trip.destination}</h3>
                    <p className="text-sm text-slate-400 mb-4">{trip.country}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <Calendar size={14} className="text-blue-400" />
                      {trip.dates}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
                      <MapPin size={14} className="text-blue-400" />
                      {trip.type}
                    </div>
                    
                    <button className="btn-secondary w-full text-sm py-2">
                      Ver Detalles
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center border border-dashed border-slate-700">
              <Plane size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 mb-4">No tienes viajes próximos programados.</p>
              <Link href="/" className="btn-primary inline-flex">
                Buscar Vuelos
              </Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="text-cyan-400" /> Guardados para después
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {savedTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold">{trip.destination}</p>
                    <p className="text-slate-300 text-xs">{trip.country}</p>
                  </div>
                  <div className="absolute top-3 right-3 glass rounded-lg px-2 py-1 text-xs font-bold text-white">
                    {trip.price}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
}
