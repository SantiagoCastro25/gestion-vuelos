"""
routes/crew.py - Endpoints de tripulación
"""
from flask import Blueprint, request, jsonify
from app.database import db
from app.models   import Tripulacion, Vuelo

crew_bp = Blueprint("crew", __name__, url_prefix="/api/tripulacion")


# ── GET /api/tripulacion  ────────────────────────────────────
@crew_bp.route("/", methods=["GET"])
def listar_tripulacion():
    vuelo_id = request.args.get("vuelo_id")
    query = Tripulacion.query
    if vuelo_id:
        query = query.filter_by(vuelo_id=vuelo_id)
    tripulacion = query.order_by(Tripulacion.rol, Tripulacion.apellido).all()
    return jsonify([t.to_dict() for t in tripulacion]), 200


# ── GET /api/tripulacion/<id>  ───────────────────────────────
@crew_bp.route("/<int:crew_id>", methods=["GET"])
def obtener_miembro(crew_id):
    miembro = Tripulacion.query.get_or_404(crew_id)
    return jsonify(miembro.to_dict()), 200


# ── POST /api/tripulacion  ───────────────────────────────────
@crew_bp.route("/", methods=["POST"])
def crear_miembro():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió JSON"}), 400

    for campo in ["nombre", "apellido", "rol"]:
        if not data.get(campo):
            return jsonify({"error": f"Falta el campo '{campo}'"}), 400

    vuelo_id = data.get("vuelo_id")
    if vuelo_id:
        vuelo = Vuelo.query.get(vuelo_id)
        if not vuelo:
            return jsonify({"error": "Vuelo no encontrado"}), 404

    try:
        miembro = Tripulacion(
            nombre   = data["nombre"],
            apellido = data["apellido"],
            rol      = data["rol"],
            licencia = data.get("licencia"),
            email    = data.get("email"),
            telefono = data.get("telefono"),
            vuelo_id = vuelo_id,
        )
        db.session.add(miembro)
        db.session.commit()
        return jsonify(miembro.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear miembro", "detalle": str(e)}), 500


# ── PUT /api/tripulacion/<id>  ───────────────────────────────
@crew_bp.route("/<int:crew_id>", methods=["PUT"])
def actualizar_miembro(crew_id):
    miembro = Tripulacion.query.get_or_404(crew_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibió JSON"}), 400

    for campo in ["nombre", "apellido", "rol", "licencia", "email", "telefono", "vuelo_id"]:
        if campo in data:
            setattr(miembro, campo, data[campo])

    try:
        db.session.commit()
        return jsonify(miembro.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar", "detalle": str(e)}), 500


# ── DELETE /api/tripulacion/<id>  ────────────────────────────
@crew_bp.route("/<int:crew_id>", methods=["DELETE"])
def eliminar_miembro(crew_id):
    miembro = Tripulacion.query.get_or_404(crew_id)
    try:
        db.session.delete(miembro)
        db.session.commit()
        return jsonify({"mensaje": f"Miembro {miembro.nombre} {miembro.apellido} eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar", "detalle": str(e)}), 500
