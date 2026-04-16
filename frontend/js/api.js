/**
 * api.js - Cliente centralizado de la API
 * Todas las funciones que hablan con el backend Flask
 */

const API_BASE = "http://localhost:5000/api";

// ── Utilidades ────────────────────────────────────────────────
async function request(method, endpoint, body = null) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error desconocido");
    return data;
  } catch (err) {
    console.error(`[API] ${method} ${endpoint}:`, err.message);
    throw err;
  }
}

// ── Vuelos ────────────────────────────────────────────────────
const VuelosAPI = {
  listar:       (estado = "")  => request("GET", `/vuelos/${estado ? "?estado=" + estado : ""}`),
  obtener:      (id)           => request("GET", `/vuelos/${id}`),
  crear:        (data)         => request("POST", "/vuelos/", data),
  actualizar:   (id, data)     => request("PUT",  `/vuelos/${id}`, data),
  eliminar:     (id)           => request("DELETE", `/vuelos/${id}`),
  estadisticas: ()             => request("GET", "/vuelos/estadisticas"),
};

// ── Pasajeros ─────────────────────────────────────────────────
const PasajerosAPI = {
  listar:     (q = "")  => request("GET", `/pasajeros/${q ? "?q=" + q : ""}`),
  obtener:    (id)      => request("GET", `/pasajeros/${id}`),
  crear:      (data)    => request("POST", "/pasajeros/", data),
  actualizar: (id, data)=> request("PUT",  `/pasajeros/${id}`, data),
  eliminar:   (id)      => request("DELETE", `/pasajeros/${id}`),
};

// ── Reservas ──────────────────────────────────────────────────
const ReservasAPI = {
  listar:    (vueloId = "") => request("GET", `/reservas/${vueloId ? "?vuelo_id=" + vueloId : ""}`),
  obtener:   (id)           => request("GET", `/reservas/${id}`),
  crear:     (data)         => request("POST", "/reservas/", data),
  cancelar:  (id)           => request("PUT",  `/reservas/${id}/cancelar`),
  eliminar:  (id)           => request("DELETE", `/reservas/${id}`),
  resumen:   ()             => request("GET", "/reservas/resumen"),
};

// ── Tripulación ───────────────────────────────────────────────
const TripulacionAPI = {
  listar:     (vueloId = "")  => request("GET", `/tripulacion/${vueloId ? "?vuelo_id=" + vueloId : ""}`),
  obtener:    (id)            => request("GET", `/tripulacion/${id}`),
  crear:      (data)          => request("POST", "/tripulacion/", data),
  actualizar: (id, data)      => request("PUT",  `/tripulacion/${id}`, data),
  eliminar:   (id)            => request("DELETE", `/tripulacion/${id}`),
};

// ── Helpers UI ────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const existing = document.getElementById("toast-container");
  if (existing) existing.remove();

  const colors = {
    success: "bg-emerald-500",
    error:   "bg-red-500",
    warning: "bg-amber-500",
    info:    "bg-sky-500",
  };

  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-2xl
    ${colors[type] || colors.success} animate-slide-in`;
  container.innerHTML = `
    <span class="text-lg">${type === "success" ? "✅" : type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️"}</span>
    <span class="font-medium">${msg}</span>
  `;
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3500);
}

function showLoader(show = true) {
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.toggle("hidden", !show);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [date, time] = dateStr.split(" ");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y} ${time || ""}`.trim();
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price);
}

// ── Badges de estado ─────────────────────────────────────────
const ESTADO_BADGE = {
  programado: { cls: "bg-sky-500/20 text-sky-300 border-sky-500/30",     label: "Programado" },
  embarcando: { cls: "bg-amber-500/20 text-amber-300 border-amber-500/30", label: "Embarcando" },
  en_vuelo:   { cls: "bg-violet-500/20 text-violet-300 border-violet-500/30", label: "En Vuelo" },
  aterrizado: { cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", label: "Aterrizado" },
  cancelado:  { cls: "bg-red-500/20 text-red-300 border-red-500/30",      label: "Cancelado" },
  confirmada: { cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", label: "Confirmada" },
  completada: { cls: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30", label: "Completada" },
  pendiente:  { cls: "bg-amber-500/20 text-amber-300 border-amber-500/30", label: "Pendiente" },
  cancelada:  { cls: "bg-red-500/20 text-red-300 border-red-500/30",      label: "Cancelada" },
};

function badge(estado) {
  const b = ESTADO_BADGE[estado] || { cls: "bg-slate-500/20 text-slate-300", label: estado };
  return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${b.cls}">${b.label}</span>`;
}
