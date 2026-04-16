/**
 * reservas.js - Lógica de la página de reservas
 */

let vueloActualFiltro = "";

// ── Cargar reservas ────────────────────────────────────────────
async function cargarReservas(vueloId = "") {
  const tbody = document.getElementById("tabla-reservas");
  try {
    const reservas = await ReservasAPI.listar(vueloId);
    renderTabla(reservas);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-10 text-center text-red-400">⚠️ No se pudo conectar con la API</td></tr>`;
  }
}

function renderTabla(reservas) {
  const tbody  = document.getElementById("tabla-reservas");
  const footer = document.getElementById("tabla-footer");
  footer.textContent = `${reservas.length} reserva${reservas.length !== 1 ? "s" : ""} encontrada${reservas.length !== 1 ? "s" : ""}`;

  if (!reservas.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-12 text-center text-slate-500">No hay reservas con ese filtro</td></tr>`;
    return;
  }

  const claseIcon = { economica: "✈", ejecutiva: "💼", primera: "👑" };

  tbody.innerHTML = reservas.map(r => `
    <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td class="px-6 py-4"><span class="text-slate-400 font-mono text-xs">#${String(r.id).padStart(4,"0")}</span></td>
      <td class="px-6 py-4"><span class="font-bold text-sky-400">${r.numero_vuelo || "—"}</span></td>
      <td class="px-6 py-4">
        <p class="text-slate-200 text-xs">${(r.origen || "").split("(")[0].trim()}</p>
        <p class="text-slate-500 text-xs">→ ${(r.destino || "").split("(")[0].trim()}</p>
        <p class="text-slate-600 text-xs mt-0.5">${formatDate(r.fecha_salida)}</p>
      </td>
      <td class="px-6 py-4 text-slate-200 text-sm">${r.pasajero || "—"}</td>
      <td class="px-6 py-4">
        <span class="font-mono text-sky-300 text-sm font-semibold">${r.asiento || "—"}</span>
      </td>
      <td class="px-6 py-4 text-slate-400 text-sm">${claseIcon[r.clase] || ""} ${r.clase?.charAt(0).toUpperCase() + r.clase?.slice(1) || "—"}</td>
      <td class="px-6 py-4 text-slate-300 text-sm font-medium">${formatPrice(r.precio)}</td>
      <td class="px-6 py-4">${badge(r.estado)}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          ${r.estado !== "cancelada" ? `
            <button onclick="cancelarReserva(${r.id})"
              class="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-all" title="Cancelar">
              ✕ Cancelar
            </button>` : ""}
          <button onclick="confirmarEliminar(${r.id})"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all" title="Eliminar">🗑️</button>
        </div>
      </td>
    </tr>`).join("");
}

// ── Filtro por vuelo ──────────────────────────────────────────
function filtrarVuelo(vueloId) {
  vueloActualFiltro = vueloId;
  document.getElementById("filtro-vuelo").value = vueloId;
  cargarReservas(vueloId);
}

// ── Poblar selects del modal ──────────────────────────────────
async function poblarSelects() {
  try {
    const [vuelos, pasajeros] = await Promise.all([
      VuelosAPI.listar(),
      PasajerosAPI.listar(),
    ]);

    // Select de vuelo en modal
    const selVuelo = document.getElementById("f-vuelo");
    vuelos
      .filter(v => v.estado !== "cancelado" && v.estado !== "aterrizado")
      .forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = `${v.numero_vuelo} — ${v.origen.split("(")[0].trim()} → ${v.destino.split("(")[0].trim()} (${v.asientos_disponibles} disp.)`;
        selVuelo.appendChild(opt);
      });

    // Select de pasajero en modal
    const selPasajero = document.getElementById("f-pasajero");
    pasajeros.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nombre} ${p.apellido} — ${p.documento}`;
      selPasajero.appendChild(opt);
    });

    // Filtro de vuelo en la barra
    const filtro = document.getElementById("filtro-vuelo");
    vuelos.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = `${v.numero_vuelo} — ${v.origen.split("(")[0].trim()} → ${v.destino.split("(")[0].trim()}`;
      filtro.appendChild(opt);
    });
  } catch (e) {
    console.error("Error al poblar selects:", e);
  }
}

// ── Modal ─────────────────────────────────────────────────────
function abrirModal() {
  document.getElementById("f-vuelo").value    = "";
  document.getElementById("f-pasajero").value = "";
  document.getElementById("f-asiento").value  = "";
  document.getElementById("f-clase").value    = "economica";
  document.getElementById("f-precio").value   = "";
  document.getElementById("modal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
}

document.getElementById("modal").addEventListener("click", function(e) {
  if (e.target === this) cerrarModal();
});

// ── Crear reserva ─────────────────────────────────────────────
async function crearReserva() {
  const vueloId    = document.getElementById("f-vuelo").value;
  const pasajeroId = document.getElementById("f-pasajero").value;

  if (!vueloId || !pasajeroId) {
    showToast("Selecciona un vuelo y un pasajero", "warning");
    return;
  }

  const data = {
    vuelo_id:    parseInt(vueloId),
    pasajero_id: parseInt(pasajeroId),
    asiento:     document.getElementById("f-asiento").value.trim().toUpperCase() || null,
    clase:       document.getElementById("f-clase").value,
    precio:      parseFloat(document.getElementById("f-precio").value) || 0,
  };

  showLoader(true);
  try {
    const reserva = await ReservasAPI.crear(data);
    showToast(`Reserva #${reserva.id} creada correctamente`);
    cerrarModal();
    cargarReservas(vueloActualFiltro);
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    showLoader(false);
  }
}

// ── Cancelar reserva ──────────────────────────────────────────
async function cancelarReserva(id) {
  if (!confirm(`¿Cancelar la reserva #${String(id).padStart(4,"0")}?`)) return;
  showLoader(true);
  try {
    await ReservasAPI.cancelar(id);
    showToast("Reserva cancelada");
    cargarReservas(vueloActualFiltro);
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    showLoader(false);
  }
}

// ── Eliminar ──────────────────────────────────────────────────
function confirmarEliminar(id) {
  if (!confirm(`¿Eliminar permanentemente la reserva #${String(id).padStart(4,"0")}?`)) return;
  eliminarReserva(id);
}

async function eliminarReserva(id) {
  showLoader(true);
  try {
    await ReservasAPI.eliminar(id);
    showToast("Reserva eliminada");
    cargarReservas(vueloActualFiltro);
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    showLoader(false);
  }
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  try {
    await fetch("http://localhost:5000/api/health");
    document.getElementById("api-status").innerHTML =
      `<span class="w-2 h-2 bg-emerald-400 rounded-full"></span> API conectada`;
    document.getElementById("api-status").className = "flex items-center gap-2 text-xs text-emerald-400";
  } catch {}

  await Promise.all([
    poblarSelects(),
    cargarReservas(),
  ]);
}

init();
