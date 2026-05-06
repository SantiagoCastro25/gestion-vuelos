<?php
require_once __DIR__ . '/config.php';

// Actualizar estados basados en la hora antes de procesar cualquier petición
try { actualizarEstadosDinamicos(); } catch (Exception $e) {}

// ── CORS ──────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ── Parsear ruta ──────────────────────────────────────────────
$base   = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path   = trim(substr($uri, strlen($base)), '/');
$parts  = explode('/', $path);
$resource = $parts[0] ?? '';
$seg1     = $parts[1] ?? null;   // id o "estadisticas" / "resumen"
$seg2     = $parts[2] ?? null;   // "cancelar"
$method   = $_SERVER['REQUEST_METHOD'];
$body     = (array) json_decode(file_get_contents('php://input'), true);

// ── Router ────────────────────────────────────────────────────
switch ($resource) {
    case '':
    case 'health':
        respond(['status' => 'ok', 'service' => 'AeroGest PHP API']);

    case 'vuelos':
        require_once __DIR__ . '/vuelos.php';
        handleVuelos($method, $seg1, $body);
        break;

    case 'pasajeros':
        require_once __DIR__ . '/pasajeros.php';
        handlePasajeros($method, $seg1, $body);
        break;

    case 'reservas':
        require_once __DIR__ . '/reservas.php';
        handleReservas($method, $seg1, $seg2, $body);
        break;

    default:
        error('Endpoint no encontrado', 404);
}
