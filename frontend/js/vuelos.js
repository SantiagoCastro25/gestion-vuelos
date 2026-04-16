/**
 * vuelos.js - Lógica de la página de vuelos
 */

let vuelosData  = [];
let estadoActual = "";
let editandoId   = null;

// ── Cargar y mostrar vuelos ───────────────────────────────────
async function cargarVuelos(estado = "") {
  const tbody = document.getElementById("tabla-vuelos");
  try {
    vuelosData = await VuelosAPI.listar(estado);
    renderTabla(vuelosData);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-10 text-center text-red-400">⚠️ No se pudo conectar con la API. ¿Está corriendo Flask?</td></tr>`;
    document.getElementById("api-status").innerHTML =
      `<span class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span> API desconectada`;
    document.getElementById("api-status").className = "flex items-center gap-2 text-xs text-red-400";
  }
}

function renderTabla(vuelos) {
  const tbody  = document.getElementById("tabla-vuelos");
  const footer = document.getElementById("tabla-footer");
  footer.textContent = `Mostrando ${vuelos.length} vuelo${vuelos.length !== 1 ? "s" : ""}`;

  if (!vuelos.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-12 text-center text-slate-500">No hay vuelos con ese filtro</td></tr>`;
    return;
  }

  tbody.innerHTML = vuelos.map(v => `
    <tr class="border-b border-slate-800/50 hover:bg-slate-800/30">
      <td class="px-6 py-4"><span class="font-bold text-sky-400">${v.numero_vuelo}</span></td>
      <td class="px-6 py-4 text-slate-300 text-sm">${v.aerolinea}</td>
      <td class="px-6 py-4">
        <p class="text-slate-200 text-xs font-medium">${v.origen}</p>
        <p class="text-slate-500 text-xs">→ ${v.destino}</p>
      </td>
      <td class="px-6 py-4 text-slate-300 text-xs">${formatDate(v.fecha_salida)}</td>
      <td class="px-6 py-4 text-slate-300 text-xs">${formatDate(v.fecha_llegada)}</td>
      <td class="px-6 py-4 text-slate-400 text-xs">${v.terminal || "—"} / ${v.puerta || "—"}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-1.5">
          <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-16">
            <div class="h-full ${v.asientos_disponibles === 0 ? 'bg-red-500' : 'bg-sky-500'} rounded-full"
              style="width:${Math.round(((v.capacidad - v.asientos_disponibles)/v.capacidad)*100)}%"></div>
          </div>
          <span class="text-xs ${v.asientos_disponibles === 0 ? 'text-red-400' : 'text-slate-400'}">${v.asientos_disponibles}/${v.capacidad}</span>
        </div>
      </td>
      <td class="px-6 py-4">${badge(v.estado)}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editarVuelo(${v.id})"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 transition-all text-sm" title="Editar">✏️</button>
          <button onclick="confirmarEliminar(${v.id}, '${v.numero_vuelo}')"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all text-sm" title="Eliminar">🗑️</button>
        </div>
      </td>
    </tr>`).join("");
}

// ── Filtros ───────────────────────────────────────────────────
function filtrarEstado(estado) {
  estadoActual = estado;
  document.querySelectorAll(".filtro-btn").forEach(btn => {
    const isActive = btn.dataset.estado === estado;
    btn.className = isActive
      ? "filtro-btn px-4 py-2 rounded-xl text-sm font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-all"
      : "filtro-btn px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 transition-all";
  });
  cargarVuelos(estado);
}

// ── Modal ─────────────────────────────────────────────────────
function abrirModal(vuelo = null) {
  editandoId = vuelo ? vuelo.id : null;
  document.getElementById("modal-title").textContent = vuelo ? "Editar Vuelo" : "Nuevo Vuelo";
  document.getElementById("vuelo-id").value    = vuelo?.id || "";
  document.getElementById("f-numero").value    = vuelo?.numero_vuelo || "";
  document.getElementById("f-aerolinea").value = vuelo?.aerolinea || "";
  document.getElementById("f-origen").value    = vuelo?.origen || "";
  document.getElementById("f-destino").value   = vuelo?.destino || "";
  document.getElementById("f-salida").value    = vuelo ? vuelo.fecha_salida.replace(" ", "T") : "";
  document.getElementById("f-llegada").value   = vuelo ? vuelo.fecha_llegada.replace(" ", "T") : "";
  document.getElementById("f-capacidad").value = vuelo?.capacidad || 150;
  document.getElementById("f-estado").value    = vuelo?.estado || "programado";
  document.getElementById("f-terminal").value  = vuelo?.terminal || "";
  document.getElementById("f-puerta").value    = vuelo?.puerta || "";
  document.getElementById("f-numero").disabled = !!vuelo;
  document.getElementById("modal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
  editandoId = null;
}

// Cerrar modal al hacer clic fuera
document.getElementById("modal").addEventListener("click", function(e) {
  if (e.target === this) cerrarModal();
});

// ── Guardar (crear o actualizar) ──────────────────────────────
async function guardarVuelo() {
  const data = {
    numero_vuelo: document.getElementById("f-numero").value.trim().toUpperCase(),
    aerolinea:    document.getElementById("f-aerolinea").value.trim(),
    origen:       document.getElementById("f-origen").value.trim(),
    destino:      document.getElementById("f-destino").value.trim(),
    fecha_salida: document.getElementById("f-salida").value,
    fecha_llegada:document.getElementById("f-llegada").value,
    capacidad:    parseInt(document.getElementById("f-capacidad").value) || 150,
    estado:       document.getElementById("f-estado").value,
    terminal:     document.getElementById("f-terminal").value.trim() || null,
    puerta:       document.getElementById("f-puerta").value.trim() || null,
  };

  if (!data.numero_vuelo || !data.aerolinea || !data.origen || !data.destino || !data.fecha_salida || !data.fecha_llegada) {
    showToast("Por favor completa todos los campos obligatorios", "warning");
    return;
  }

  showLoader(true);
  try {
    if (editandoId) {
      await VuelosAPI.actualizar(editandoId, data);
      showToast(`Vuelo actualizado correctamente`);
    } else {
      await VuelosAPI.crear(data);
      showToast(`Vuelo ${data.numero_vuelo} creado correctamente`);
    }
    cerrarModal();
    cargarVuelos(estadoActual);
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    showLoader(false);
  }
}

// ── Editar ────────────────────────────────────────────────────
async function editarVuelo(id) {
  try {
    const vuelo = await VuelosAPI.obtener(id);
    abrirModal(vuelo);
  } catch (e) {
    showToast("Error al cargar el vuelo", "error");
  }
}

// ── Eliminar ──────────────────────────────────────────────────
function confirmarEliminar(id, numero) {
  if (!confirm(`¿Seguro que deseas eliminar el vuelo ${numero}?\nEsta acción eliminará también sus reservas y tripulación.`)) return;
  eliminarVuelo(id, numero);
}

async function eliminarVuelo(id, numero) {
  showLoader(true);
  try {
    await VuelosAPI.eliminar(id);
    showToast(`Vuelo ${numero} eliminado`);
    cargarVuelos(estadoActual);
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    showLoader(false);
  }
}

// ── Inicializar ───────────────────────────────────────────────
async function init() {
  // Verificar API
  try {
    await fetch("http://localhost:5000/api/health");
    document.getElementById("api-status").innerHTML =
      `<span class="w-2 h-2 bg-emerald-400 rounded-full"></span> API conectada`;
    document.getElementById("api-status").className = "flex items-center gap-2 text-xs text-emerald-400";
  } catch {}

  cargarVuelos();
}

init();
