/**
 * api.js - Cliente centralizado de la API PHP
 * La URL se detecta automáticamente — funciona desde cualquier dispositivo/IP.
 */

// Detecta la raíz del proyecto dinámicamente
const _root = window.location.pathname.split('/frontend/')[0];
const API_BASE = `${window.location.origin}${_root}/api`;

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

  const accent = {
    success: "#22c55e",
    error:   "#ef4444",
    warning: "#f59e0b",
    info:    "#3b82f6",
  };

  const container = document.createElement("div");
  container.id = "toast-container";
  container.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    display:flex;align-items:center;gap:12px;
    padding:12px 18px;border-radius:10px;
    background:#ffffff;border:1px solid #e4e4e7;
    box-shadow:0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1);
    font-size:13px;color:#18181b;font-family:'Inter',sans-serif;
    animation:fadeUp .3s ease both;
  `;
  container.innerHTML = `
    <span style="width:4px;height:32px;border-radius:4px;background:${accent[type] || accent.success};flex-shrink:0;"></span>
    <span>${msg}</span>
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
  programado: { cls: "badge-sky",     label: "Programado" },
  embarcando: { cls: "badge-amber",   label: "Embarcando" },
  en_vuelo:   { cls: "badge-violet",  label: "En Vuelo" },
  aterrizado: { cls: "badge-emerald", label: "Aterrizado" },
  cancelado:  { cls: "badge-red",     label: "Cancelado" },
  confirmada: { cls: "badge-emerald", label: "Confirmada" },
  completada: { cls: "badge-fuchsia", label: "Completada" },
  pendiente:  { cls: "badge-amber",   label: "Pendiente" },
  cancelada:  { cls: "badge-red",     label: "Cancelada" },
};

// Badge CSS is defined inline in each HTML page (minimalist style)
function badge(estado) {
  const b = ESTADO_BADGE[estado] || { cls: "badge-zinc", label: estado };
  return `<span class="badge ${b.cls}">${b.label}</span>`;
}
