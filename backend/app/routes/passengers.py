"""
routes/passengers.py - Endpoints de pasajeros
"""
from flask import Blueprint, request, jsonify
from app.database import db
from app.models   import Pasajero

passengers_bp = Blueprint("passengers", __name__, url_prefix="/api/pasajeros")


# ── GET /api/pasajeros  ──────────────────────────────────────
@passengers_bp.route("/", methods=["GET"])
def listar_pasajeros():
    busqueda = request.args.get("q", "").strip()
    query = Pasajero.query
    if busqueda:
        like = f"%{busqueda}%"
        query = query.filter(
            Pasajero.nombre.like(like)    |
            Pasajero.apellido.like(like)  |
            Pasajero.documento.like(like) |
            Pasajero.email.like(like)
        )
    pasajeros = query.order_by(Pasajero.apellido).all()
    return jsonify([p.to_dict() for p in pasajeros]), 200


# ── GET /api/pasajeros/<id>  ─────────────────────────────────
@passengers_bp.route("/<int:pasajero_id>", methods=["GET"])
def obtener_pasajero(pasajero_id):
    pasajero = Pasajero.query.get_or_404(pasajero_id)
    return jsonify(pasajero.to_dict()), 200


# ── POST /api/pasajeros  ─────────────────────────────────────
@passengers_bp.route("/", methods=["POST"])
def crear_pasajero():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió JSON"}), 400

    campos_req = ["nombre", "apellido", "documento", "email"]
    for campo in campos_req:
        if not data.get(campo):
            return jsonify({"error": f"Falta el campo '{campo}'"}), 400

    if Pasajero.query.filter_by(documento=data["documento"]).first():
        return jsonify({"error": "El documento ya está registrado"}), 409

    try:
        pasajero = Pasajero(
            nombre         = data["nombre"],
            apellido       = data["apellido"],
            documento      = data["documento"],
            tipo_documento = data.get("tipo_documento", "cedula"),
            email          = data["email"],
            telefono       = data.get("telefono"),
            nacionalidad   = data.get("nacionalidad", "Colombia"),
        )
        db.session.add(pasajero)
        db.session.commit()
        return jsonify(pasajero.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear pasajero", "detalle": str(e)}), 500


# ── PUT /api/pasajeros/<id>  ─────────────────────────────────
@passengers_bp.route("/<int:pasajero_id>", methods=["PUT"])
def actualizar_pasajero(pasajero_id):
    pasajero = Pasajero.query.get_or_404(pasajero_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió JSON"}), 400

    for campo in ["nombre", "apellido", "documento", "tipo_documento", "email", "telefono", "nacionalidad"]:
        if campo in data:
            setattr(pasajero, campo, data[campo])

    try:
        db.session.commit()
        return jsonify(pasajero.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar", "detalle": str(e)}), 500


# ── DELETE /api/pasajeros/<id>  ──────────────────────────────
@passengers_bp.route("/<int:pasajero_id>", methods=["DELETE"])
def eliminar_pasajero(pasajero_id):
    pasajero = Pasajero.query.get_or_404(pasajero_id)
    try:
        db.session.delete(pasajero)
        db.session.commit()
        return jsonify({"mensaje": f"Pasajero {pasajero.nombre} {pasajero.apellido} eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar", "detalle": str(e)}), 500
