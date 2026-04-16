"""
models/passenger.py - Modelo de Pasajeros
"""
from app.database import db
from datetime import datetime

class Pasajero(db.Model):
    __tablename__ = "pasajeros"

    id              = db.Column(db.Integer, primary_key=True)
    nombre          = db.Column(db.String(100), nullable=False)
    apellido        = db.Column(db.String(100), nullable=False)
    documento       = db.Column(db.String(20), nullable=False, unique=True)
    tipo_documento  = db.Column(
        db.Enum('cedula','pasaporte','tarjeta_id'),
        nullable=False, default='cedula'
    )
    email           = db.Column(db.String(150), nullable=False)
    telefono        = db.Column(db.String(20), nullable=True)
    nacionalidad    = db.Column(db.String(100), default='Colombia')
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    reservas = db.relationship('Reserva', back_populates='pasajero', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id":            self.id,
            "nombre":        self.nombre,
            "apellido":      self.apellido,
            "nombre_completo": f"{self.nombre} {self.apellido}",
            "documento":     self.documento,
            "tipo_documento": self.tipo_documento,
            "email":         self.email,
            "telefono":      self.telefono,
            "nacionalidad":  self.nacionalidad,
        }
