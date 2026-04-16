/**
 * pasajeros.js - Lógica de la página de pasajeros
 */

let editandoId = null;
let debounceTimer;

// ── Cargar y mostrar ──────────────────────────────────────────
async function cargarPasajeros(busqueda = "") {
  const tbody = document.getElementById("tabla-pasajeros");
  try {
    const pasajeros = await PasajerosAPI.listar(encodeURIComponent(busqueda));
    renderTabla(pasajeros);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-10 text-center text-red-400">⚠️ No se pudo conectar con la API</td></tr>`;
  }
}

function renderTabla(pasajeros) {
  const tbody  = document.getElementById("tabla-pasajeros");
  const footer = document.getElementById("tabla-footer");
  footer.textContent = `${pasajeros.length} pasajero${pasajeros.length !== 1 ? "s" : ""} encontrado${pasajeros.length !== 1 ? "s" : ""}`;

  if (!pasajeros.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-slate-500">No se encontraron pasajeros</td></tr>`;
    return;
  }

  const tiposDoc = { cedula: "🪪 Cédula", pasaporte: "📘 Pasaporte", tarjeta_id: "🃏 Tarjeta ID" };

  tbody.innerHTML = pasajeros.map(p => `
    <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-sky-500/20 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-300 font-bold text-sm">
            ${p.nombre[0]}${p.apellido[0]}
          </div>
          <div>
            <p class="text-white font-medium">${p.nombre} ${p.apellido}</p>
            <p class="text-slate-500 text-xs">ID #${p.id}</p>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <p class="text-slate-300 text-sm">${p.documento}</p>
        <p class="text-slate-500 text-xs">${tiposDoc[p.tipo_documento] || p.tipo_documento}</p>
      </td>
      <td class="px-6 py-4 text-slate-300 text-sm">${p.email}</td>
      <td class="px-6 py-4 text-slate-400 text-sm">${p.telefono || "—"}</td>
      <td class="px-6 py-4 text-slate-400 text-sm">🌍 ${p.nacionalidad}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editarPasajero(${p.id})"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 transition-all" title="Editar">✏️</button>
          <button onclick="confirmarEliminar(${p.id}, '${p.nombre} ${p.apellido}')"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all" title="Eliminar">🗑️</button>
        </div>
      </td>
    </tr>`).join("");
}

// ── Búsqueda con debounce ─────────────────────────────────────
function buscarPasajero(valor) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => cargarPasajeros(valor), 350);
}

// ── Modal ─────────────────────────────────────────────────────
function abrirModal(p = null) {
  editandoId = p ? p.id : null;
  document.getElementById("modal-title").textContent = p ? "Editar Pasajero" : "Nuevo Pasajero";
  document.getElementById("pasajero-id").value   = p?.id || "";
  document.getElementById("f-nombre").value      = p?.nombre || "";
  document.getElementById("f-apellido").value    = p?.apellido || "";
  document.getElementById("f-tipo-doc").value    = p?.tipo_documento || "cedula";
  document.getElementById("f-documento").value   = p?.documento || "";
  document.getElementById("f-email").value       = p?.email || "";
  document.getElementById("f-telefono").value    = p?.telefono || "";
  document.getElementById("f-nacionalidad").value= p?.nacionalidad || "Colombia";
  document.getElementById("f-documento").disabled = !!p;
  document.getElementById("modal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
  editandoId = null;
}

document.getElementById("modal").addEventListener("click", function(e) {
  if (e.target === this) cerrarModal();
});

// ── Guardar ───────────────────────────────────────────────────
async function guardarPasajero() {
  const data = {
    nombre:         document.getElementById("f-nombre").value.trim(),
    apellido:       document.getElementById("f-apellido").value.trim(),
    tipo_documento: document.getElementById("f-tipo-doc").value,
    documento:      document.getElementById("f-documento").value.trim(),
    email:          document.getElementById("f-email").value.trim(),
    telefono:       document.getElementById("f-telefono").value.trim() || null,
    nacionalidad:   document.getElementById("f-nacionalidad").value.trim() || "Colombia",
  };

  if (!data.nombre || !data.apellido || !data.documento || !data.email) {
    showToast("Completa los campos obligatorios (*)", "warning");
    return;
  }

  showLoader(true);
  try {
    if (editandoId) {
      await PasajerosAPI.actualizar(editandoId, data);
      showToast("Pasajero actualizado correctamente");
    } else {
      await PasajerosAPI.crear(data);
      showToast(`Pasajero ${data.nombre} registrado`);
    }
    cerrarModal();
    cargarPasajeros();
  } catch (e) {
    showToast(e.message, "error");
  } finally {
    showLoader(false);
  }
}

// ── Editar ────────────────────────────────────────────────────
async function editarPasajero(id) {
  try {
    const p = await PasajerosAPI.obtener(id);
    abrirModal(p);
  } catch (e) {
    showToast("Error al cargar el pasajero", "error");
  }
}

// ── Eliminar ──────────────────────────────────────────────────
function confirmarEliminar(id, nombre) {
  if (!confirm(`¿Eliminar al pasajero ${nombre}?\nSus reservas también serán eliminadas.`)) return;
  eliminarPasajero(id, nombre);
}

async function eliminarPasajero(id, nombre) {
  showLoader(true);
  try {
    await PasajerosAPI.eliminar(id);
    showToast(`${nombre} eliminado`);
    cargarPasajeros();
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
  cargarPasajeros();
}

init();
