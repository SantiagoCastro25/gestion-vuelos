"""
models/flight.py - Modelo de Vuelos
"""
from app.database import db
from datetime import datetime

class Vuelo(db.Model):
    __tablename__ = "vuelos"

    id                   = db.Column(db.Integer, primary_key=True)
    numero_vuelo         = db.Column(db.String(10), nullable=False, unique=True)
    aerolinea            = db.Column(db.String(100), nullable=False)
    origen               = db.Column(db.String(100), nullable=False)
    destino              = db.Column(db.String(100), nullable=False)
    fecha_salida         = db.Column(db.DateTime, nullable=False)
    fecha_llegada        = db.Column(db.DateTime, nullable=False)
    capacidad            = db.Column(db.Integer, nullable=False, default=150)
    asientos_disponibles = db.Column(db.Integer, nullable=False, default=150)
    estado               = db.Column(
        db.Enum('programado','embarcando','en_vuelo','aterrizado','cancelado'),
        nullable=False, default='programado'
    )
    terminal             = db.Column(db.String(10), nullable=True)
    puerta               = db.Column(db.String(10), nullable=True)
    created_at           = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at           = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    reservas    = db.relationship('Reserva',     back_populates='vuelo',    cascade='all, delete-orphan')
    tripulacion = db.relationship('Tripulacion', back_populates='vuelo')

    def to_dict(self):
        return {
            "id":                   self.id,
            "numero_vuelo":         self.numero_vuelo,
            "aerolinea":            self.aerolinea,
            "origen":               self.origen,
            "destino":              self.destino,
            "fecha_salida":         self.fecha_salida.strftime("%Y-%m-%d %H:%M"),
            "fecha_llegada":        self.fecha_llegada.strftime("%Y-%m-%d %H:%M"),
            "capacidad":            self.capacidad,
            "asientos_disponibles": self.asientos_disponibles,
            "ocupados":             self.capacidad - self.asientos_disponibles,
            "estado":               self.estado,
            "terminal":             self.terminal,
            "puerta":               self.puerta,
        }
