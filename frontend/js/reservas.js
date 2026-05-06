/**
 * reservas.js - Lógica de la página de reservas
 */

let vueloActualFiltro = "";

// ── Cargar Reservas ─────────────────────────────────────────────
async function cargarReservas() {
  const tbody = document.getElementById("tabla-reservas");
  try {
    const vueloId = document.getElementById("filtro-vuelo").value;
    reservasData = await ReservasAPI.listar(vueloId);
    renderTabla(reservasData);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#e11d48;padding:48px 0;">Error al conectar con la API</td></tr>`;
  }
}

function renderTabla(reservas) {
  const tbody  = document.getElementById("tabla-reservas");
  const footer = document.getElementById("tabla-footer");
  footer.textContent = `Mostrando ${reservas.length} reserva${reservas.length !== 1 ? "s" : ""}`;

  if (!reservas.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-12 text-center text-zinc-500">No hay reservas registradas</td></tr>`;
    return;
  }

  tbody.innerHTML = reservas.map(r => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td class="px-6 py-4"><span class="text-slate-400 text-xs font-mono font-semibold">#${r.id}</span></td>
      <td class="px-6 py-4"><span class="font-bold text-sky-600 text-sm">${r.numero_vuelo}</span></td>
      <td class="px-6 py-4">
        <p class="text-slate-900 text-xs font-bold">${r.origen}</p>
        <p class="text-slate-500 text-xs font-medium">→ ${r.destino}</p>
      </td>
      <td class="px-6 py-4">
        <p class="text-slate-900 text-sm font-bold">${r.pasajero_nombre} ${r.pasajero_apellido}</p>
        <p class="text-slate-500 text-xs font-medium">${r.pasajero_doc}</p>
      </td>
      <td class="px-6 py-4 font-mono text-slate-600 text-sm font-semibold">${r.asiento || "—"}</td>
      <td class="px-6 py-4 text-slate-600 text-sm capitalize font-medium">${r.clase}</td>
      <td class="px-6 py-4 text-slate-900 font-bold text-sm">${formatearPrecio(r.precio)}</td>
      <td class="px-6 py-4">${badge(r.estado)}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          ${r.estado !== 'cancelada' ? `<button onclick="confirmarCancelar(${r.id})"
            class="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-600 transition-all text-sm" title="Cancelar Reserva">🚫</button>` : ''}
          <button onclick="confirmarEliminar(${r.id})"
            class="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all text-sm" title="Eliminar del Sistema">🗑️</button>
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

// ── Inicialización ────────────────────────────────────────────
async function init() {
  await poblarSelects();
  cargarReservas();
}

init();
