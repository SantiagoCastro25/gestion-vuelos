<?php
function handleVuelos(string $method, ?string $seg, array $body): void {
    $pdo = db();

    // GET /vuelos/estadisticas
    if ($seg === 'estadisticas') {
        $rows = $pdo->query("SELECT estado, COUNT(*) c FROM vuelos GROUP BY estado")->fetchAll();
        $s = ['total'=>0,'programado'=>0,'embarcando'=>0,'en_vuelo'=>0,'aterrizado'=>0,'cancelado'=>0];
        foreach ($rows as $r) { $s[$r['estado']] = (int)$r['c']; $s['total'] += (int)$r['c']; }
        respond($s);
    }

    // Collection: GET /vuelos/  POST /vuelos/
    if ($seg === null || $seg === '') {
        if ($method === 'GET') {
            $estado = $_GET['estado'] ?? '';
            $sql    = "SELECT * FROM vuelos";
            $params = [];
            if ($estado) { $sql .= " WHERE estado = ?"; $params[] = $estado; }
            $sql .= " ORDER BY fecha_salida ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            respond($stmt->fetchAll());
        }
        if ($method === 'POST') {
            $cap = (int)($body['capacidad'] ?? 150);
            $stmt = $pdo->prepare("INSERT INTO vuelos
                (numero_vuelo,aerolinea,origen,destino,fecha_salida,fecha_llegada,
                 capacidad,asientos_disponibles,estado,terminal,puerta)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)");
            $stmt->execute([
                strtoupper($body['numero_vuelo']),
                $body['aerolinea'], $body['origen'], $body['destino'],
                toMysqlDate($body['fecha_salida']), toMysqlDate($body['fecha_llegada']),
                $cap, $cap,
                $body['estado'] ?? 'programado',
                $body['terminal'] ?? null, $body['puerta'] ?? null,
            ]);
            $id = $pdo->lastInsertId();
            $v  = $pdo->prepare("SELECT * FROM vuelos WHERE id=?");
            $v->execute([$id]);
            respond($v->fetch(), 201);
        }
    }

    // Single resource: GET PUT DELETE /vuelos/{id}
    $id = (int)$seg;
    if ($method === 'GET') {
        $st = $pdo->prepare("SELECT * FROM vuelos WHERE id=?");
        $st->execute([$id]);
        $v = $st->fetch();
        if (!$v) error('Vuelo no encontrado', 404);
        respond($v);
    }
    if ($method === 'PUT') {
        $map = ['aerolinea','origen','destino','capacidad','estado','terminal','puerta'];
        $dates = ['fecha_salida','fecha_llegada'];
        $sets=[]; $params=[];
        foreach (array_merge($map,$dates) as $f) {
            if (!array_key_exists($f,$body)) continue;
            $sets[]   = "$f=?";
            $params[] = in_array($f,$dates) ? toMysqlDate($body[$f]) : $body[$f];
        }
        if ($sets) { $params[]=$id; $pdo->prepare("UPDATE vuelos SET ".implode(',',$sets)." WHERE id=?")->execute($params); }
        $st=$pdo->prepare("SELECT * FROM vuelos WHERE id=?"); $st->execute([$id]);
        respond($st->fetch());
    }
    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM vuelos WHERE id=?")->execute([$id]);
        respond(['ok'=>true]);
    }
    error('Método no permitido', 405);
}
