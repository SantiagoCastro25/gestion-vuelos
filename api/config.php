<?php
// ── Configuración de base de datos ────────────────────────────
define('DB_HOST',    'localhost');
define('DB_PORT',    '3306');
define('DB_NAME',    'flights_management');
define('DB_USER',    'root');
define('DB_PASS',    '');          // Cambia si tu MySQL tiene contraseña
define('DB_CHARSET', 'utf8mb4');

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

function respond(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function error(string $msg, int $code = 400): void {
    respond(['error' => $msg], $code);
}

// Convierte datetime-local "2026-05-06T08:30" → "2026-05-06 08:30:00"
function toMysqlDate(?string $s): ?string {
    if (!$s) return null;
    return str_replace('T', ' ', $s) . (strpos($s, ':') === strlen($s) - 3 ? ':00' : '');
}

// ── Lógica de Estados Dinámicos ───────────────────────────────
function actualizarEstadosDinamicos(): void {
    $pdo = db();
    
    // 1. Aterrizados: NOW() >= fecha_llegada (y no cancelados)
    $pdo->exec("UPDATE vuelos SET estado = 'aterrizado' WHERE NOW() >= fecha_llegada AND estado NOT IN ('aterrizado', 'cancelado')");
    
    // 2. En vuelo: NOW() >= fecha_salida AND NOW() < fecha_llegada
    $pdo->exec("UPDATE vuelos SET estado = 'en_vuelo' WHERE NOW() >= fecha_salida AND NOW() < fecha_llegada AND estado NOT IN ('en_vuelo', 'cancelado', 'aterrizado')");
    
    // 3. Embarcando: Faltan 45 min o menos para la salida
    $pdo->exec("UPDATE vuelos SET estado = 'embarcando' WHERE NOW() >= DATE_SUB(fecha_salida, INTERVAL 45 MINUTE) AND NOW() < fecha_salida AND estado NOT IN ('embarcando', 'cancelado', 'en_vuelo', 'aterrizado')");
    
    // 4. Programado: Faltan más de 45 min
    $pdo->exec("UPDATE vuelos SET estado = 'programado' WHERE NOW() < DATE_SUB(fecha_salida, INTERVAL 45 MINUTE) AND estado NOT IN ('programado', 'cancelado')");
    
    // 5. Reservas completadas automáticamente cuando el vuelo aterriza
    $pdo->exec("UPDATE reservas r JOIN vuelos v ON r.vuelo_id = v.id SET r.estado = 'completada' WHERE v.estado = 'aterrizado' AND r.estado = 'confirmada'");
}

