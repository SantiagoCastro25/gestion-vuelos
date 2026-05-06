<?php
function handlePasajeros(string $method, ?string $seg, array $body): void {
    $pdo = db();

    // Collection
    if ($seg === null || $seg === '') {
        if ($method === 'GET') {
            $q = trim($_GET['q'] ?? '');
            $sql = "SELECT * FROM pasajeros";
            $params = [];
            if ($q) {
                $like = "%$q%";
                $sql .= " WHERE nombre LIKE ? OR apellido LIKE ? OR documento LIKE ? OR email LIKE ?";
                $params = [$like,$like,$like,$like];
            }
            $sql .= " ORDER BY apellido, nombre";
            $st = $pdo->prepare($sql); $st->execute($params);
            respond($st->fetchAll());
        }
        if ($method === 'POST') {
            $st = $pdo->prepare("INSERT INTO pasajeros
                (nombre,apellido,documento,tipo_documento,email,telefono,nacionalidad)
                VALUES (?,?,?,?,?,?,?)");
            $st->execute([
                $body['nombre'], $body['apellido'], $body['documento'],
                $body['tipo_documento'] ?? 'cedula',
                $body['email'],
                $body['telefono'] ?? null,
                $body['nacionalidad'] ?? 'Colombia',
            ]);
            $id = $pdo->lastInsertId();
            $r  = $pdo->prepare("SELECT * FROM pasajeros WHERE id=?"); $r->execute([$id]);
            respond($r->fetch(), 201);
        }
    }

    $id = (int)$seg;
    if ($method === 'GET') {
        $st = $pdo->prepare("SELECT * FROM pasajeros WHERE id=?"); $st->execute([$id]);
        $p = $st->fetch(); if (!$p) error('Pasajero no encontrado', 404);
        respond($p);
    }
    if ($method === 'PUT') {
        $fields = ['nombre','apellido','tipo_documento','email','telefono','nacionalidad'];
        $sets=[]; $params=[];
        foreach ($fields as $f) {
            if (!array_key_exists($f,$body)) continue;
            $sets[]=$f."=?"; $params[]=$body[$f];
        }
        if ($sets) { $params[]=$id; $pdo->prepare("UPDATE pasajeros SET ".implode(',',$sets)." WHERE id=?")->execute($params); }
        $st=$pdo->prepare("SELECT * FROM pasajeros WHERE id=?"); $st->execute([$id]);
        respond($st->fetch());
    }
    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM pasajeros WHERE id=?")->execute([$id]);
        respond(['ok'=>true]);
    }
    error('Método no permitido', 405);
}
