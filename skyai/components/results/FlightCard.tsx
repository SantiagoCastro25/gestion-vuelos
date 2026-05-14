"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ArrowRight,
  Wifi,
  UtensilsCrossed,
  Tv2,
  Star,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Shield,
  Luggage,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  stopDescription: string;
  price: number;
  currency: string;
  cabin: string;
  seatsLeft?: number;
  priceScore: string;
  priceLabel: string;
  amenities?: string[];
  refundable?: boolean;
}

interface FlightCardProps {
  flight: Flight;
  currency?: string;
  onSelect?: (flight: Flight) => void;
  onPredict?: (flight: Flight) => void;
  selected?: boolean;
}

const AMENITY_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
  wifi: { icon: Wifi, label: "WiFi" },
  meals: { icon: UtensilsCrossed, label: "Comidas" },
  entertainment: { icon: Tv2, label: "Entretenimiento" },
};

const AIRLINE_COLORS: Record<string, string> = {
  AV: "from-red-600 to-orange-500",
  LA: "from-red-700 to-red-500",
  AA: "from-blue-700 to-blue-500",
  CM: "from-blue-600 to-teal-500",
  UA: "from-blue-800 to-blue-600",
  IB: "from-red-700 to-yellow-500",
  BA: "from-blue-900 to-blue-700",
  LH: "from-yellow-500 to-blue-600",
  default: "from-blue-600 to-purple-600",
};

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return iso;
  }
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function FlightCard({ flight, onSelect, onPredict, selected = false }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { currency, convertPrice } = useCurrencyStore();
  const convertedPrice = convertPrice(flight.price);
  
  const priceClass =
    flight.priceScore === "excellent"
      ? "price-excellent"
      : flight.priceScore === "good"
      ? "price-good"
      : "price-high";

  const airlineColor = AIRLINE_COLORS[flight.airlineCode] ?? AIRLINE_COLORS.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden transition-all duration-300 ${
        selected ? "border-blue-500/60 shadow-blue-500/20 shadow-lg" : ""
      }`}
    >
      {/* Main card content */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Airline */}
          <div className="flex items-center gap-3 min-w-[140px]">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${airlineColor} flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0`}
            >
              {flight.airlineCode}
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{flight.airline}</p>
              <p className="text-xs text-slate-400">{flight.flightNumber}</p>
            </div>
          </div>

          {/* Flight timeline */}
          <div className="flex-1 flex items-center gap-4">
            {/* Departure */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.departure)}</p>
              <p className="text-sm font-semibold text-slate-300">{flight.origin}</p>
              <p className="text-xs text-slate-500">{flight.originCity}</p>
            </div>

            {/* Duration line */}
            <div className="flex-1 flex flex-col items-center gap-1 min-w-[100px]">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={11} />
                {flight.duration}
              </div>
              <div className="relative w-full flex items-center">
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 via-blue-500/60 to-blue-500/30" />
                <ArrowRight size={14} className="text-blue-400 mx-1 flex-shrink-0" />
              </div>
              <span
                className={`badge text-[10px] ${
                  flight.stops === 0 ? "badge-green" : "badge-orange"
                }`}
              >
                {flight.stopDescription}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.arrival)}</p>
              <p className="text-sm font-semibold text-slate-300">{flight.destination}</p>
              <p className="text-xs text-slate-500">{flight.destinationCity}</p>
            </div>
          </div>

          {/* Price block */}
          <div className="flex flex-col items-end gap-2 min-w-[160px]">
            <div className="text-right">
              <div className={`badge ${priceClass} mb-1`}>
                {flight.priceScore === "excellent" && <TrendingDown size={10} />}
                {flight.priceLabel}
              </div>
              <p className="text-2xl font-bold text-white">{formatPrice(convertedPrice, currency)}</p>
              <p className="text-xs text-slate-400">por persona · {flight.cabin}</p>
              {flight.seatsLeft && flight.seatsLeft <= 5 && (
                <p className="text-xs text-orange-400 mt-0.5">⚡ Solo {flight.seatsLeft} asientos</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => onPredict?.(flight)}
                className="btn-secondary text-xs py-2 px-3 flex-1"
                title="Ver predicción de precio"
              >
                <BarChart3 size={13} />
                <span className="hidden sm:inline">Predecir</span>
              </button>
              <button
                onClick={() => onSelect?.(flight)}
                className="btn-primary text-xs py-2 px-4 flex-1"
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>

        {/* Amenities & refundable row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-500/10">
          <div className="flex items-center gap-3">
            {flight.amenities?.map((amenity) => {
              const { icon: Icon, label } = AMENITY_ICONS[amenity] ?? { icon: Star, label: amenity };
              return (
                <div key={amenity} className="flex items-center gap-1 text-xs text-slate-400" title={label}>
                  <Icon size={12} className="text-blue-400" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              );
            })}
            {flight.refundable && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <Shield size={12} />
                <span className="hidden sm:inline">Reembolsable</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Luggage size={12} className="text-blue-400" />
              <span className="hidden sm:inline">Equipaje incluido</span>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            {expanded ? "Ocultar detalles" : "Ver detalles"}
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-blue-500/10 bg-slate-900/40"
          >
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Aerolínea</p>
                <p className="text-sm font-medium text-white">{flight.airline}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">N° de vuelo</p>
                <p className="text-sm font-medium text-white">{flight.flightNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Clase</p>
                <p className="text-sm font-medium text-white capitalize">{flight.cabin}</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  ${convertedPrice.toLocaleString()} <span className="text-sm font-normal text-slate-400">{currency}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Tiempo de vuelo</p>
                <p className="text-sm font-medium text-white">{flight.duration}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Escalas</p>
                <p className="text-sm font-medium text-white">{flight.stopDescription}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Reembolso</p>
                <p className={`text-sm font-medium ${flight.refundable ? "text-green-400" : "text-slate-500"}`}>
                  {flight.refundable ? "Sí, reembolsable" : "No reembolsable"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">IA Score</p>
                <div className={`badge ${priceClass} text-xs`}>
                  <Sparkles size={10} />
                  {flight.priceLabel}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
