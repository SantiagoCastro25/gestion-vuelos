"""
models/crew.py - Modelo de Tripulación
"""
from app.database import db
from datetime import datetime

class Tripulacion(db.Model):
    __tablename__ = "tripulacion"

    id          = db.Column(db.Integer, primary_key=True)
    nombre      = db.Column(db.String(100), nullable=False)
    apellido    = db.Column(db.String(100), nullable=False)
    rol         = db.Column(
        db.Enum('piloto','copiloto','sobrecargo','asistente_vuelo'),
        nullable=False, default='asistente_vuelo'
    )
    licencia    = db.Column(db.String(50), nullable=True)
    email       = db.Column(db.String(150), nullable=True)
    telefono    = db.Column(db.String(20), nullable=True)
    vuelo_id    = db.Column(db.Integer, db.ForeignKey('vuelos.id', ondelete='SET NULL'), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    vuelo = db.relationship('Vuelo', back_populates='tripulacion')

    def to_dict(self):
        return {
            "id":          self.id,
            "nombre":      self.nombre,
            "apellido":    self.apellido,
            "nombre_completo": f"{self.nombre} {self.apellido}",
            "rol":         self.rol,
            "licencia":    self.licencia,
            "email":       self.email,
            "telefono":    self.telefono,
            "vuelo_id":    self.vuelo_id,
            "vuelo_numero": self.vuelo.numero_vuelo if self.vuelo else None,
        }
