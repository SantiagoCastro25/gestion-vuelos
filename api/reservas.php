<?php
function handleReservas(string $method, ?string $seg, ?string $action, array $body): void {
    $pdo = db();

    // GET /reservas/resumen
    if ($seg === 'resumen') {
        $rows = $pdo->query("SELECT estado, COUNT(*) c FROM reservas GROUP BY estado")->fetchAll();
        $s = ['total'=>0,'confirmadas'=>0,'completadas'=>0,'pendientes'=>0,'canceladas'=>0];
        foreach ($rows as $r) {
            $s['total'] += (int)$r['c'];
            if ($r['estado']==='confirmada')  $s['confirmadas']  += (int)$r['c'];
            if ($r['estado']==='completada')  $s['completadas']  += (int)$r['c'];
            if ($r['estado']==='pendiente')   $s['pendientes']   += (int)$r['c'];
            if ($r['estado']==='cancelada')   $s['canceladas']   += (int)$r['c'];
        }
        respond($s);
    }

    // Collection
    if ($seg === null || $seg === '') {
        if ($method === 'GET') {
            $vid = (int)($_GET['vuelo_id'] ?? 0);
            $sql = "SELECT r.*, v.numero_vuelo, v.origen, v.destino, v.fecha_salida,
                           CONCAT(p.nombre,' ',p.apellido) AS pasajero
                    FROM reservas r
                    LEFT JOIN vuelos v ON r.vuelo_id=v.id
                    LEFT JOIN pasajeros p ON r.pasajero_id=p.id";
            $params = [];
            if ($vid) { $sql .= " WHERE r.vuelo_id=?"; $params[] = $vid; }
            $sql .= " ORDER BY r.fecha_reserva DESC";
            $st=$pdo->prepare($sql); $st->execute($params);
            respond($st->fetchAll());
        }
        if ($method === 'POST') {
            // Verificar disponibilidad
            $vst=$pdo->prepare("SELECT asientos_disponibles FROM vuelos WHERE id=?");
            $vst->execute([$body['vuelo_id']]);
            $vuelo=$vst->fetch();
            if (!$vuelo) error('Vuelo no encontrado');
            if ((int)$vuelo['asientos_disponibles']<=0) error('No hay asientos disponibles');

            // Verificar asiento duplicado
            if (!empty($body['asiento'])) {
                $ast=$pdo->prepare("SELECT id FROM reservas WHERE vuelo_id=? AND asiento=? AND estado!='cancelada'");
                $ast->execute([$body['vuelo_id'],$body['asiento']]);
                if ($ast->fetch()) error("El asiento {$body['asiento']} ya está ocupado");
            }

            // Crear reserva
            $st=$pdo->prepare("INSERT INTO reservas (vuelo_id,pasajero_id,asiento,clase,precio,estado)
                                VALUES (?,?,?,?,?,'confirmada')");
            $st->execute([
                (int)$body['vuelo_id'], (int)$body['pasajero_id'],
                $body['asiento'] ?? null,
                $body['clase'] ?? 'economica',
                (float)($body['precio'] ?? 0),
            ]);
            $rid=$pdo->lastInsertId();

            // Decrementar asientos
            $pdo->prepare("UPDATE vuelos SET asientos_disponibles=asientos_disponibles-1 WHERE id=?")->execute([$body['vuelo_id']]);

            $r=$pdo->prepare("SELECT * FROM reservas WHERE id=?"); $r->execute([$rid]);
            respond($r->fetch(), 201);
        }
    }

    $id=(int)$seg;

    // PUT /reservas/{id}/cancelar
    if ($method==='PUT' && $action==='cancelar') {
        $st=$pdo->prepare("SELECT * FROM reservas WHERE id=?"); $st->execute([$id]);
        $res=$st->fetch(); if (!$res) error('Reserva no encontrada',404);
        if ($res['estado']!=='cancelada') {
            $pdo->prepare("UPDATE reservas SET estado='cancelada' WHERE id=?")->execute([$id]);
            $pdo->prepare("UPDATE vuelos SET asientos_disponibles=asientos_disponibles+1 WHERE id=?")->execute([$res['vuelo_id']]);
        }
        $st=$pdo->prepare("SELECT * FROM reservas WHERE id=?"); $st->execute([$id]);
        respond($st->fetch());
    }

    if ($method==='GET') {
        $st=$pdo->prepare("SELECT * FROM reservas WHERE id=?"); $st->execute([$id]);
        $r=$st->fetch(); if (!$r) error('Reserva no encontrada',404);
        respond($r);
    }
    if ($method==='DELETE') {
        $st=$pdo->prepare("SELECT * FROM reservas WHERE id=?"); $st->execute([$id]);
        $res=$st->fetch();
        if ($res && $res['estado']!=='cancelada')
            $pdo->prepare("UPDATE vuelos SET asientos_disponibles=asientos_disponibles+1 WHERE id=?")->execute([$res['vuelo_id']]);
        $pdo->prepare("DELETE FROM reservas WHERE id=?")->execute([$id]);
        respond(['ok'=>true]);
    }
    error('Método no permitido',405);
}
