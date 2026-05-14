"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  Hotel,
  Package,
  ArrowLeftRight,
  Calendar,
  Users,
  Search,
  MapPin,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Airport {
  code: string;
  name: string;
  country: string;
  type: string;
}

const CABIN_CLASSES = [
  { value: "economy", label: "Económica" },
  { value: "premium_economy", label: "Premium Económica" },
  { value: "business", label: "Business" },
  { value: "first", label: "Primera Clase" },
];

type SearchTab = "flights" | "hotels" | "packages";
type TripType = "roundtrip" | "oneway" | "multicity";

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function SearchForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>("flights");
  const [tripType, setTripType] = useState<TripType>("roundtrip");
  
  // States for actual search codes
  const [origin, setOrigin] = useState("BOG");
  const [destination, setDestination] = useState("MIA");
  
  // States for display input text
  const [originQuery, setOriginQuery] = useState("BOG - Bogotá");
  const [destQuery, setDestQuery] = useState("MIA - Miami");
  
  // States for lists
  const [originResults, setOriginResults] = useState<Airport[]>([]);
  const [destResults, setDestResults] = useState<Airport[]>([]);
  const [loadingOrigin, setLoadingOrigin] = useState(false);
  const [loadingDest, setLoadingDest] = useState(false);
  
  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);
  
  const debouncedOrigin = useDebounce(originQuery, 400);
  const debouncedDest = useDebounce(destQuery, 400);

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [showPassengers, setShowPassengers] = useState(false);

  // Hotel specific
  const [hotelCity, setHotelCity] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");

  // Fetch origin airports
  useEffect(() => {
    // Only search if user typed something new (and it's not the already selected format "CODE - City")
    if (debouncedOrigin.length > 2 && !debouncedOrigin.includes(" - ")) {
      setLoadingOrigin(true);
      fetch(`/api/airports?q=${encodeURIComponent(debouncedOrigin)}`)
        .then((res) => res.json())
        .then((data) => setOriginResults(data.airports || []))
        .catch(console.error)
        .finally(() => setLoadingOrigin(false));
    }
  }, [debouncedOrigin]);

  // Fetch destination airports
  useEffect(() => {
    if (debouncedDest.length > 2 && !debouncedDest.includes(" - ")) {
      setLoadingDest(true);
      fetch(`/api/airports?q=${encodeURIComponent(debouncedDest)}`)
        .then((res) => res.json())
        .then((data) => setDestResults(data.airports || []))
        .catch(console.error)
        .finally(() => setLoadingDest(false));
    }
  }, [debouncedDest]);

  const swapAirports = () => {
    const tempCode = origin;
    const tempQuery = originQuery;
    setOrigin(destination);
    setOriginQuery(destQuery);
    setDestination(tempCode);
    setDestQuery(tempQuery);
  };

  const handleSearch = () => {
    if (activeTab === "flights") {
      const params = new URLSearchParams({
        origin,
        destination,
        departureDate: departureDate || new Date().toISOString().split("T")[0],
        returnDate,
        adults: String(adults),
        children: String(children),
        infants: String(infants),
        cabinClass,
        tripType,
      });
      router.push(`/results?${params.toString()}`);
    } else if (activeTab === "hotels") {
      const params = new URLSearchParams({
        city: hotelCity || "Miami",
        checkin: checkin || new Date().toISOString().split("T")[0],
        checkout: checkout || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        adults: String(adults),
      });
      router.push(`/hotels?${params.toString()}`);
    }
  };

  const tabs = [
    { id: "flights" as SearchTab, label: "Vuelos", icon: Plane },
    { id: "hotels" as SearchTab, label: "Hoteles", icon: Hotel },
    { id: "packages" as SearchTab, label: "Paquetes", icon: Package },
  ];

  const totalPassengers = adults + children + infants;

  return (
    <div className="w-full max-w-5xl mx-auto relative z-20">
      {/* Tab selector */}
      <div className="flex gap-1 mb-4 relative z-10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? "active" : ""}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Main search card */}
      <motion.div
        layout
        className="glass-bright rounded-2xl p-5 shadow-2xl relative z-30"
        style={{ border: "1px solid rgba(99, 157, 255, 0.2)" }}
      >
        {activeTab === "flights" && (
          <>
            {/* Trip type */}
            <div className="flex gap-4 mb-5">
              {(["roundtrip", "oneway", "multicity"] as TripType[]).map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={tripType === type}
                    onChange={() => setTripType(type)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-slate-300 capitalize">
                    {type === "roundtrip" ? "Ida y vuelta" : type === "oneway" ? "Solo ida" : "Multi-ciudad"}
                  </span>
                </label>
              ))}
            </div>

            {/* Main search row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr] gap-3 items-end">
              {/* Origin */}
              <div className="relative z-50">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  Origen
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => {
                      setOriginQuery(e.target.value);
                      setShowOriginList(true);
                    }}
                    onFocus={() => {
                      setShowOriginList(true);
                      if (originQuery.includes(" - ")) setOriginQuery("");
                    }}
                    onBlur={() => setTimeout(() => setShowOriginList(false), 200)}
                    placeholder="Escribe ciudad o país..."
                    className="input-field pl-9 font-medium"
                    autoComplete="off"
                  />
                  {loadingOrigin && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={14} className="text-blue-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Autocomplete Origin */}
                <AnimatePresence>
                  {showOriginList && originQuery.length > 2 && !originQuery.includes(" - ") && originResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 right-0 glass-bright rounded-xl border border-blue-500/20 shadow-2xl max-h-64 overflow-y-auto z-[60]"
                    >
                      {originResults.map((airport) => (
                        <button
                          key={airport.code}
                          onMouseDown={() => {
                            setOrigin(airport.code);
                            setOriginQuery(`${airport.code} - ${airport.name}`);
                            setShowOriginList(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition-colors text-left border-b border-white/5 last:border-0"
                        >
                          <Plane size={16} className="text-slate-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{airport.code}</span>
                              <span className="text-sm text-slate-300">{airport.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">{airport.country}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Swap button */}
              <button
                onClick={swapAirports}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full glass border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all group mb-0.5 z-40"
                title="Intercambiar aeropuertos"
              >
                <ArrowLeftRight size={16} className="text-blue-400 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Destination */}
              <div className="relative z-40">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  Destino
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setShowDestList(true);
                    }}
                    onFocus={() => {
                      setShowDestList(true);
                      if (destQuery.includes(" - ")) setDestQuery("");
                    }}
                    onBlur={() => setTimeout(() => setShowDestList(false), 200)}
                    placeholder="Escribe ciudad o país..."
                    className="input-field pl-9 font-medium"
                    autoComplete="off"
                  />
                  {loadingDest && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={14} className="text-blue-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Autocomplete Destination */}
                <AnimatePresence>
                  {showDestList && destQuery.length > 2 && !destQuery.includes(" - ") && destResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 right-0 glass-bright rounded-xl border border-blue-500/20 shadow-2xl max-h-64 overflow-y-auto z-[60]"
                    >
                      {destResults.map((airport) => (
                        <button
                          key={airport.code}
                          onMouseDown={() => {
                            setDestination(airport.code);
                            setDestQuery(`${airport.code} - ${airport.name}`);
                            setShowDestList(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition-colors text-left border-b border-white/5 last:border-0"
                        >
                          <Plane size={16} className="text-slate-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{airport.code}</span>
                              <span className="text-sm text-slate-300">{airport.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">{airport.country}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dates */}
              <div className="relative z-30">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  {tripType === "roundtrip" ? "Fechas" : "Fecha de salida"}
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 z-10" />
                  <div className="flex">
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="input-field pl-9 text-sm"
                      style={{ borderRadius: tripType === "roundtrip" ? "var(--radius-md) 0 0 var(--radius-md)" : undefined }}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {tripType === "roundtrip" && (
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="input-field text-sm"
                        style={{ borderRadius: "0 var(--radius-md) var(--radius-md) 0", borderLeft: "none" }}
                        min={departureDate || new Date().toISOString().split("T")[0]}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Passengers + Class */}
              <div className="relative z-30">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                  Pasajeros
                </label>
                <button
                  onClick={() => setShowPassengers(!showPassengers)}
                  className="input-field flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-blue-400" />
                    <span className="text-sm">
                      {totalPassengers} {totalPassengers === 1 ? "Pasajero" : "Pasajeros"}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                <AnimatePresence>
                  {showPassengers && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 w-72 glass-bright rounded-xl border border-blue-500/20 shadow-2xl p-4 z-[60]"
                    >
                      <PassengerCounter label="Adultos" sublabel="12+ años" value={adults} onChange={setAdults} min={1} max={9} />
                      <PassengerCounter label="Niños" sublabel="2-11 años" value={children} onChange={setChildren} min={0} max={8} />
                      <PassengerCounter label="Bebés" sublabel="Menos de 2 años" value={infants} onChange={setInfants} min={0} max={adults} />
                      
                      <div className="mt-3 pt-3 border-t border-blue-500/10">
                        <label className="block text-xs text-slate-400 mb-1.5">Clase</label>
                        <select
                          value={cabinClass}
                          onChange={(e) => setCabinClass(e.target.value)}
                          className="input-field text-sm"
                        >
                          {CABIN_CLASSES.map((c) => (
                            <option key={c.value} value={c.value} className="bg-slate-800">
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => setShowPassengers(false)} className="btn-primary w-full mt-4 text-sm py-2">
                        Listo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {activeTab === "hotels" && (
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                Ciudad o destino
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  value={hotelCity}
                  onChange={(e) => setHotelCity(e.target.value)}
                  placeholder="Ej: Miami, Madrid, Cancún..."
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Check-in</label>
              <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className="input-field" min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Check-out</label>
              <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className="input-field" min={checkin} />
            </div>
            <div />
          </div>
        )}

        {activeTab === "packages" && (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <div className="text-center">
              <Package size={40} className="mx-auto mb-3 text-blue-400 opacity-60" />
              <p className="text-sm">Búsqueda de paquetes disponible próximamente</p>
            </div>
          </div>
        )}

        {activeTab !== "packages" && (
          <div className="flex justify-center mt-5">
            <button
              onClick={handleSearch}
              className="btn-primary px-10 py-3.5 text-base font-semibold"
            >
              <Search size={18} />
              Buscar{activeTab === "flights" ? " Vuelos" : " Hoteles"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function PassengerCounter({
  label,
  sublabel,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  sublabel: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        <p className="text-xs text-slate-400">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>
        <span className="w-6 text-center text-white font-medium">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}
