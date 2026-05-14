"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface PredictionData {
  recommendation: string;
  confidence: number;
  priceScore: string;
  currentPrice: number;
  predictedLow: number;
  predictedHigh: number;
  bestDayToBuy: string;
  priceHistory: Array<{ date: string; price: number; predicted?: boolean }>;
  tips: string[];
  aiAnalysis: string;
}

interface PricePredictionProps {
  flight: {
    id: string;
    origin: string;
    destination: string;
    price: number;
    departure: string;
  };
  onClose: () => void;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-bright rounded-lg p-3 border border-blue-500/20 shadow-xl text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-bold text-white">${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function PricePrediction({ flight, onClose }: PricePredictionProps) {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: flight.origin,
            destination: flight.destination,
            departureDate: flight.departure,
            currentPrice: flight.price,
          }),
        });
        const prediction = await res.json();
        setData(prediction);
      } catch {
        console.error("Failed to fetch prediction");
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [flight]);

  const scoreColor =
    data?.priceScore === "excellent"
      ? "#10d98f"
      : data?.priceScore === "good"
      ? "#f59e0b"
      : "#f87171";

  const ScoreIcon =
    data?.priceScore === "excellent"
      ? TrendingDown
      : data?.priceScore === "good"
      ? Minus
      : TrendingUp;

  const chartData = data?.priceHistory.map((item) => ({
    ...item,
    historicalPrice: item.predicted ? undefined : item.price,
    predictedPrice: item.predicted ? item.price : undefined,
    currentMark: item.date === "Hoy" ? item.price : undefined,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(4, 13, 33, 0.85)", backdropFilter: "blur(8px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl glass-bright rounded-2xl border border-blue-500/20 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">Predicción de Precios</h2>
                <p className="text-sm text-slate-400">
                  {flight.origin} → {flight.destination}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center pulse-glow">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">Analizando precios con IA...</p>
                  <p className="text-slate-400 text-sm mt-1">Consultando tendencias históricas</p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            ) : data ? (
              <>
                {/* Score cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-4 text-center border border-blue-500/10">
                    <p className="text-xs text-slate-400 mb-2">Precio Actual</p>
                    <p className="text-xl font-bold text-white">${data.currentPrice}</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center border" style={{ borderColor: `${scoreColor}30` }}>
                    <p className="text-xs text-slate-400 mb-2">Evaluación IA</p>
                    <div className="flex items-center justify-center gap-1" style={{ color: scoreColor }}>
                      <ScoreIcon size={16} />
                      <p className="text-sm font-bold">{data.recommendation}</p>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4 text-center border border-blue-500/10">
                    <p className="text-xs text-slate-400 mb-2">Confianza</p>
                    <p className="text-xl font-bold" style={{ color: scoreColor }}>{data.confidence}%</p>
                  </div>
                </div>

                {/* Price range */}
                <div className="glass rounded-xl p-4 border border-blue-500/10">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-slate-400">Rango de precio estimado</p>
                    <div className="flex items-center gap-1 text-xs text-blue-400">
                      <Clock size={12} />
                      {data.bestDayToBuy}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-green-400 mb-1">Mínimo</p>
                      <p className="text-lg font-bold text-white">${data.predictedLow}</p>
                    </div>
                    <div className="flex-1 relative h-3 bg-slate-800 rounded-full">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #10d98f, #f59e0b, #f87171)",
                          width: "100%",
                          opacity: 0.6,
                        }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-blue-500"
                        style={{
                          left: `${((data.currentPrice - data.predictedLow) / (data.predictedHigh - data.predictedLow)) * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-red-400 mb-1">Máximo</p>
                      <p className="text-lg font-bold text-white">${data.predictedHigh}</p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="glass rounded-xl p-4 border border-blue-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-white">Histórico y predicción</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-blue-400" /> Histórico
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-purple-400 border-dashed" style={{ borderTop: "2px dashed" }} /> Predicción
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3d7eff" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3d7eff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,157,255,0.08)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#4a6a9a" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#4a6a9a" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={data.currentPrice} stroke="#00d4ff" strokeDasharray="4 4" strokeWidth={1.5} />
                      <Area
                        type="monotone"
                        dataKey="historicalPrice"
                        stroke="#3d7eff"
                        strokeWidth={2}
                        fill="url(#colorHist)"
                        connectNulls={false}
                        dot={{ fill: "#3d7eff", r: 3, strokeWidth: 0 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="predictedPrice"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        fill="url(#colorPred)"
                        connectNulls={false}
                        dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Analysis */}
                {data.aiAnalysis && (
                  <div className="glass rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-purple-400" />
                      <p className="text-sm font-medium text-white">Análisis de SkyAI</p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{data.aiAnalysis}</p>
                  </div>
                )}

                {/* Tips */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={15} className="text-yellow-400" />
                    <p className="text-sm font-medium text-white">Consejos del sistema</p>
                  </div>
                  {data.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      {tip.includes("quedan") || tip.includes("Solo") ? (
                        <AlertCircle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      )}
                      {tip}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
