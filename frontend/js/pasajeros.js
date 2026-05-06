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
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#e11d48;padding:48px 0;">Error al conectar con la API</td></tr>`;
  }
}

function renderTabla(pasajeros) {
  const tbody  = document.getElementById("tabla-pasajeros");
  const footer = document.getElementById("tabla-footer");
  footer.textContent = `Mostrando ${pasajeros.length} pasajero${pasajeros.length !== 1 ? "s" : ""}`;

  if (!pasajeros.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-12 text-center text-zinc-500">No se encontraron pasajeros</td></tr>`;
    return;
  }

  tbody.innerHTML = pasajeros.map(p => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td class="px-6 py-4"><span class="font-bold text-slate-900">${p.nombre} ${p.apellido}</span></td>
      <td class="px-6 py-4 text-slate-600 text-sm font-semibold">
        <span class="uppercase text-xs text-slate-400 mr-1">${p.tipo_documento.substring(0,3)}</span>
        ${p.numero_documento}
      </td>
      <td class="px-6 py-4 text-slate-600 text-sm font-medium">${p.email}</td>
      <td class="px-6 py-4 text-slate-600 text-sm font-medium">${p.telefono || "—"}</td>
      <td class="px-6 py-4 text-slate-600 text-sm font-medium">${p.nacionalidad || "—"}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editarPasajero(${p.id})"
            class="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-600 transition-all text-sm" title="Editar">✏️</button>
          <button onclick="confirmarEliminar(${p.id}, '${p.nombre}')"
            class="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all text-sm" title="Eliminar">🗑️</button>
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
  document.getElementById("modal-title").style.color = p ? "#2563eb" : "#18181b";
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
  cargarPasajeros();
}

init();
