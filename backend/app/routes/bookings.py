"""
routes/bookings.py - Endpoints de reservas
"""
from flask import Blueprint, request, jsonify
from app.database import db
from app.models   import Reserva, Vuelo, Pasajero

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/reservas")


# ── GET /api/reservas  ───────────────────────────────────────
@bookings_bp.route("/", methods=["GET"])
def listar_reservas():
    vuelo_id = request.args.get("vuelo_id")
    query = Reserva.query
    if vuelo_id:
        query = query.filter_by(vuelo_id=vuelo_id)
    reservas = query.order_by(Reserva.fecha_reserva.desc()).all()
    return jsonify([r.to_dict() for r in reservas]), 200


# ── GET /api/reservas/<id>  ──────────────────────────────────
@bookings_bp.route("/<int:reserva_id>", methods=["GET"])
def obtener_reserva(reserva_id):
    reserva = Reserva.query.get_or_404(reserva_id)
    return jsonify(reserva.to_dict()), 200


# ── POST /api/reservas  ──────────────────────────────────────
@bookings_bp.route("/", methods=["POST"])
def crear_reserva():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió JSON"}), 400

    for campo in ["vuelo_id", "pasajero_id"]:
        if not data.get(campo):
            return jsonify({"error": f"Falta el campo '{campo}'"}), 400

    vuelo = Vuelo.query.get(data["vuelo_id"])
    if not vuelo:
        return jsonify({"error": "Vuelo no encontrado"}), 404

    pasajero = Pasajero.query.get(data["pasajero_id"])
    if not pasajero:
        return jsonify({"error": "Pasajero no encontrado"}), 404

    if vuelo.asientos_disponibles <= 0:
        return jsonify({"error": "No hay asientos disponibles en este vuelo"}), 409

    if vuelo.estado == "cancelado":
        return jsonify({"error": "No se pueden hacer reservas en un vuelo cancelado"}), 409

    # Verificar que el asiento no esté ocupado
    asiento = data.get("asiento")
    if asiento:
        existe = Reserva.query.filter_by(vuelo_id=vuelo.id, asiento=asiento, estado="confirmada").first()
        if existe:
            return jsonify({"error": f"El asiento {asiento} ya está ocupado"}), 409

    try:
        reserva = Reserva(
            vuelo_id    = vuelo.id,
            pasajero_id = pasajero.id,
            asiento     = asiento,
            clase       = data.get("clase", "economica"),
            estado      = "confirmada",
            precio      = float(data.get("precio", 0.00)),
        )
        db.session.add(reserva)

        # Reducir asientos disponibles
        vuelo.asientos_disponibles -= 1
        db.session.commit()
        return jsonify(reserva.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear reserva", "detalle": str(e)}), 500


# ── PUT /api/reservas/<id>/cancelar  ─────────────────────────
@bookings_bp.route("/<int:reserva_id>/cancelar", methods=["PUT"])
def cancelar_reserva(reserva_id):
    reserva = Reserva.query.get_or_404(reserva_id)
    if reserva.estado == "cancelada":
        return jsonify({"error": "La reserva ya está cancelada"}), 409

    reserva.estado = "cancelada"

    # Devolver asiento al vuelo
    vuelo = Vuelo.query.get(reserva.vuelo_id)
    if vuelo:
        vuelo.asientos_disponibles = min(vuelo.asientos_disponibles + 1, vuelo.capacidad)

    try:
        db.session.commit()
        return jsonify({"mensaje": "Reserva cancelada correctamente", "reserva": reserva.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al cancelar", "detalle": str(e)}), 500


# ── DELETE /api/reservas/<id>  ───────────────────────────────
@bookings_bp.route("/<int:reserva_id>", methods=["DELETE"])
def eliminar_reserva(reserva_id):
    reserva = Reserva.query.get_or_404(reserva_id)
    try:
        # Si era confirmada, devolver asiento
        if reserva.estado == "confirmada":
            vuelo = Vuelo.query.get(reserva.vuelo_id)
            if vuelo:
                vuelo.asientos_disponibles = min(vuelo.asientos_disponibles + 1, vuelo.capacidad)
        db.session.delete(reserva)
        db.session.commit()
        return jsonify({"mensaje": "Reserva eliminada"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar", "detalle": str(e)}), 500


# ── GET /api/reservas/resumen  ───────────────────────────────
@bookings_bp.route("/resumen", methods=["GET"])
def resumen_reservas():
    total       = Reserva.query.count()
    confirmadas = Reserva.query.filter_by(estado="confirmada").count()
    canceladas  = Reserva.query.filter_by(estado="cancelada").count()
    pendientes  = Reserva.query.filter_by(estado="pendiente").count()
    completadas = Reserva.query.filter_by(estado="completada").count()
    return jsonify({
        "total": total, "confirmadas": confirmadas,
        "canceladas": canceladas, "pendientes": pendientes,
        "completadas": completadas,
    }), 200
