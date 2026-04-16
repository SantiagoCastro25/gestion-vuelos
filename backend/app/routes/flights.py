"""
routes/flights.py - Endpoints de vuelos
"""
from flask import Blueprint, request, jsonify
from app.database import db
from app.models   import Vuelo
from datetime import datetime

flights_bp = Blueprint("flights", __name__, url_prefix="/api/vuelos")


def parse_datetime(s):
    """Convierte 'YYYY-MM-DD HH:MM' a objeto datetime."""
    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    raise ValueError(f"Formato de fecha inválido: {s}")


# ── GET /api/vuelos  ──────────────────────────────────────────
@flights_bp.route("/", methods=["GET"])
def listar_vuelos():
    estado = request.args.get("estado")
    query  = Vuelo.query
    if estado:
        query = query.filter_by(estado=estado)
    vuelos = query.order_by(Vuelo.fecha_salida).all()
    return jsonify([v.to_dict() for v in vuelos]), 200


# ── GET /api/vuelos/<id>  ────────────────────────────────────
@flights_bp.route("/<int:vuelo_id>", methods=["GET"])
def obtener_vuelo(vuelo_id):
    vuelo = Vuelo.query.get_or_404(vuelo_id)
    return jsonify(vuelo.to_dict()), 200


# ── POST /api/vuelos  ────────────────────────────────────────
@flights_bp.route("/", methods=["POST"])
def crear_vuelo():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió JSON"}), 400

    campos_req = ["numero_vuelo", "aerolinea", "origen", "destino", "fecha_salida", "fecha_llegada"]
    for campo in campos_req:
        if campo not in data:
            return jsonify({"error": f"Falta el campo '{campo}'"}), 400

    # Verificar número de vuelo único
    if Vuelo.query.filter_by(numero_vuelo=data["numero_vuelo"]).first():
        return jsonify({"error": "El número de vuelo ya existe"}), 409

    try:
        capacidad = int(data.get("capacidad", 150))
        vuelo = Vuelo(
            numero_vuelo         = data["numero_vuelo"].upper(),
            aerolinea            = data["aerolinea"],
            origen               = data["origen"],
            destino              = data["destino"],
            fecha_salida         = parse_datetime(data["fecha_salida"]),
            fecha_llegada        = parse_datetime(data["fecha_llegada"]),
            capacidad            = capacidad,
            asientos_disponibles = capacidad,
            estado               = data.get("estado", "programado"),
            terminal             = data.get("terminal"),
            puerta               = data.get("puerta"),
        )
        db.session.add(vuelo)
        db.session.commit()
        return jsonify(vuelo.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500


# ── PUT /api/vuelos/<id>  ────────────────────────────────────
@flights_bp.route("/<int:vuelo_id>", methods=["PUT"])
def actualizar_vuelo(vuelo_id):
    vuelo = Vuelo.query.get_or_404(vuelo_id)
    data  = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió JSON"}), 400

    campos_fecha = ["fecha_salida", "fecha_llegada"]
    for campo in campos_fecha:
        if campo in data:
            try:
                setattr(vuelo, campo, parse_datetime(data[campo]))
            except ValueError as e:
                return jsonify({"error": str(e)}), 400

    campos_str = ["numero_vuelo", "aerolinea", "origen", "destino", "estado", "terminal", "puerta"]
    for campo in campos_str:
        if campo in data:
            setattr(vuelo, campo, data[campo])

    if "capacidad" in data:
        vuelo.capacidad = int(data["capacidad"])

    try:
        db.session.commit()
        return jsonify(vuelo.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar", "detalle": str(e)}), 500


# ── DELETE /api/vuelos/<id>  ─────────────────────────────────
@flights_bp.route("/<int:vuelo_id>", methods=["DELETE"])
def eliminar_vuelo(vuelo_id):
    vuelo = Vuelo.query.get_or_404(vuelo_id)
    try:
        db.session.delete(vuelo)
        db.session.commit()
        return jsonify({"mensaje": f"Vuelo {vuelo.numero_vuelo} eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar", "detalle": str(e)}), 500


# ── GET /api/vuelos/estadisticas  ────────────────────────────
@flights_bp.route("/estadisticas", methods=["GET"])
def estadisticas():
    total      = Vuelo.query.count()
    programado = Vuelo.query.filter_by(estado="programado").count()
    embarcando = Vuelo.query.filter_by(estado="embarcando").count()
    en_vuelo   = Vuelo.query.filter_by(estado="en_vuelo").count()
    aterrizado = Vuelo.query.filter_by(estado="aterrizado").count()
    cancelado  = Vuelo.query.filter_by(estado="cancelado").count()

    return jsonify({
        "total":      total,
        "programado": programado,
        "embarcando": embarcando,
        "en_vuelo":   en_vuelo,
        "aterrizado": aterrizado,
        "cancelado":  cancelado,
    }), 200
