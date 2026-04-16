"""
app/__init__.py - Application Factory de Flask
"""
from flask      import Flask, jsonify
from flask_cors import CORS

from app.config   import Config
from app.database import db
from app.routes   import flights_bp, passengers_bp, bookings_bp, crew_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Habilitar CORS (permite que el frontend llame al backend)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Inicializar la base de datos
    db.init_app(app)

    # Configurar Tareas Programadas (Estado de vuelos en tiempo real)
    from apscheduler.schedulers.background import BackgroundScheduler
    from app.tasks import update_real_time_status
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=update_real_time_status, args=[app], trigger="interval", seconds=60)
    scheduler.start()

    # Registrar blueprints (rutas)
    app.register_blueprint(flights_bp)
    app.register_blueprint(passengers_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(crew_bp)

    # Ruta de salud (health check)
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "message": "Flight Management API funcionando ✈️"}), 200

    # Manejo de errores 404
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Recurso no encontrado"}), 404

    # Manejo de errores 500
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Error interno del servidor"}), 500

    return app
