"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { FlightCard } from "@/components/results/FlightCard";
import { PricePrediction } from "@/components/ai/PricePrediction";
import { ChatBot } from "@/components/ai/ChatBot";
import { SearchForm } from "@/components/search/SearchForm";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Plane,
  AlertCircle,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Clock,
  Filter,
  X,
} from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";

interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
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

type SortKey = "price_asc" | "price_desc" | "duration" | "departure";

function ResultsContent() {
  const searchParams = useSearchParams();
  const { currency, convertPrice } = useCurrencyStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("price_asc");
  const [filterStops, setFilterStops] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [source, setSource] = useState("mock");

  const origin = searchParams.get("origin") ?? "BOG";
  const destination = searchParams.get("destination") ?? "MIA";
  const departureDate = searchParams.get("departureDate") ?? "";
  const adults = searchParams.get("adults") ?? "1";
  const cabinClass = searchParams.get("cabinClass") ?? "economy";

  useEffect(() => {
    fetchFlights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, departureDate, adults, cabinClass]);

  const fetchFlights = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ origin, destination, adults, cabinClass });
      if (departureDate) params.set("date", departureDate);
      const res = await fetch(`/api/flights?${params.toString()}`);
      if (!res.ok) throw new Error("Error al buscar vuelos");
      const data = await res.json();
      setFlights(data.flights ?? []);
      setSource(data.source);
    } catch (e) {
      setError("No pudimos cargar los vuelos. Por favor intenta nuevamente.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sortedFlights = [...flights]
    .filter((f) => {
      if (filterStops !== null && f.stops !== filterStops) return false;
      if (f.price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "duration": return a.duration.localeCompare(b.duration);
        case "departure": return a.departure.localeCompare(b.departure);
        default: return 0;
      }
    });

  const cheapest = flights.length ? Math.min(...flights.map((f) => f.price)) : 0;
  const priceRange = flights.length ? Math.max(...flights.map((f) => f.price)) : 2000;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />

      {/* Top bar with route info */}
      <div className="pt-16 border-b border-blue-500/10" style={{ background: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <span>{origin}</span>
                <Plane size={16} className="text-blue-400" />
                <span>{destination}</span>
              </div>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 text-sm">{departureDate || "Fecha flexible"}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 text-sm">{adults} adulto(s)</span>
              {source === "mock" && (
                <div className="badge badge-blue text-xs">
                  <Sparkles size={10} /> Modo Demo
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="btn-secondary text-sm"
            >
              Modificar búsqueda
            </button>
          </div>

          {/* Inline search form (collapsible) */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2">
                  <SearchForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* AI Banner */}
        {!loading && flights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl mb-5 border border-blue-500/20"
            style={{ background: "linear-gradient(90deg, rgba(61,126,255,0.08), rgba(124,58,237,0.05))" }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">
                <span className="text-cyan-400">SkyAI detectó</span> que el precio más bajo es{" "}
                <span className="text-green-400 font-bold">${convertPrice(cheapest).toLocaleString()} {currency}</span> — 
                haz clic en <span className="text-blue-400">&quot;Predecir&quot;</span> en cualquier vuelo para ver el mejor momento de compra.
              </p>
            </div>
            <TrendingDown size={18} className="text-green-400 flex-shrink-0" />
          </motion.div>
        )}

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="card p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-blue-400" />
                  Filtros
                </h3>
                <button
                  onClick={() => { setFilterStops(null); setMaxPrice(priceRange); }}
                  className="text-xs text-blue-400 hover:text-cyan-400 transition-colors"
                >
                  Limpiar
                </button>
              </div>

              {/* Stops filter */}
              <div className="mb-5">
                <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Escalas</p>
                <div className="space-y-2">
                  {[
                    { label: "Todos", value: null },
                    { label: "Sin escalas", value: 0 },
                    { label: "1 escala", value: 1 },
                    { label: "2+ escalas", value: 2 },
                  ].map(({ label, value }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        checked={filterStops === value}
                        onChange={() => setFilterStops(value)}
                        className="accent-blue-500"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-5">
                <div className="flex justify-between mb-3">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Precio máximo</p>
                  <p className="text-xs font-bold text-cyan-400">${convertPrice(maxPrice).toLocaleString()} {currency}</p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={priceRange || 2000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>$0</span>
                  <span>${convertPrice(priceRange || 2000).toLocaleString()} {currency}</span>
                </div>
              </div>

              {/* Airlines (decorative) */}
              <div>
                <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Aerolíneas</p>
                <div className="space-y-2">
                  {["Todas", "Avianca", "LATAM", "American", "Copa"].map((airline) => (
                    <label key={airline} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-blue-500" />
                      <span className="text-sm text-slate-300">{airline}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort & count bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-400">
                  {loading ? "Buscando..." : `${sortedFlights.length} resultado(s)`}
                </p>
                <button
                  className="md:hidden btn-secondary text-xs py-1.5 px-3"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={13} />
                  {showFilters ? "Ocultar" : "Filtros"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="text-sm bg-transparent border border-blue-500/20 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500/40"
                >
                  <option value="price_asc" className="bg-slate-800">Precio: menor primero</option>
                  <option value="price_desc" className="bg-slate-800">Precio: mayor primero</option>
                  <option value="duration" className="bg-slate-800">Duración</option>
                  <option value="departure" className="bg-slate-800">Hora de salida</option>
                </select>
              </div>
            </div>

            {/* States */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card p-5 h-36 shimmer" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="card p-8 text-center">
                <AlertCircle size={40} className="mx-auto mb-3 text-red-400" />
                <p className="text-red-400 font-medium mb-1">Error al cargar vuelos</p>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <button onClick={fetchFlights} className="btn-primary text-sm mx-auto">
                  <RefreshCw size={14} />
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && sortedFlights.length === 0 && (
              <div className="card p-12 text-center">
                <Plane size={48} className="mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-bold text-white mb-2">No encontramos vuelos</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Intenta ajustar los filtros o buscar en otras fechas.
                </p>
                <button
                  onClick={() => { setFilterStops(null); setMaxPrice(priceRange); }}
                  className="btn-secondary text-sm mx-auto"
                >
                  <X size={14} />
                  Limpiar filtros
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                <AnimatePresence>
                  {sortedFlights.map((flight, i) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <FlightCard
                        flight={flight}
                        onSelect={(f) => setSelectedFlight(f)}
                        onPredict={(f) => setSelectedFlight(f)}
                        selected={selectedFlight?.id === flight.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Price insight at bottom */}
                {sortedFlights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-xl border border-blue-500/10 flex items-center gap-3"
                    style={{ background: "rgba(13, 27, 62, 0.4)" }}
                  >
                    <Clock size={16} className="text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-slate-400">
                      <span className="text-white font-medium">Consejo SkyAI:</span> Los precios para esta ruta suelen ser{" "}
                      <span className="text-cyan-400">más bajos los martes y miércoles</span>. Si tienes flexibilidad de fechas, considera buscar en esos días.
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Prediction Modal */}
      <AnimatePresence>
        {selectedFlight && (
          <PricePrediction
            flight={{
              id: selectedFlight.id,
              origin: selectedFlight.origin,
              destination: selectedFlight.destination,
              price: selectedFlight.price,
              departure: selectedFlight.departure,
            }}
            onClose={() => setSelectedFlight(null)}
          />
        )}
      </AnimatePresence>

      <ChatBot />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4 w-10 h-10" style={{ borderWidth: "3px" }} />
          <p className="text-slate-400">Cargando resultados...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
