"""
models/booking.py - Modelo de Reservas
"""
from app.database import db
from datetime import datetime

class Reserva(db.Model):
    __tablename__ = "reservas"

    id              = db.Column(db.Integer, primary_key=True)
    vuelo_id        = db.Column(db.Integer, db.ForeignKey('vuelos.id', ondelete='CASCADE'), nullable=False)
    pasajero_id     = db.Column(db.Integer, db.ForeignKey('pasajeros.id', ondelete='CASCADE'), nullable=False)
    asiento         = db.Column(db.String(5), nullable=True)
    clase           = db.Column(
        db.Enum('economica','ejecutiva','primera'),
        nullable=False, default='economica'
    )
    estado          = db.Column(
        db.Enum('confirmada','cancelada','pendiente','completada'),
        nullable=False, default='confirmada'
    )
    precio          = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    fecha_reserva   = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    vuelo    = db.relationship('Vuelo',    back_populates='reservas')
    pasajero = db.relationship('Pasajero', back_populates='reservas')

    def to_dict(self):
        return {
            "id":           self.id,
            "vuelo_id":     self.vuelo_id,
            "pasajero_id":  self.pasajero_id,
            "numero_vuelo": self.vuelo.numero_vuelo    if self.vuelo    else None,
            "origen":       self.vuelo.origen           if self.vuelo    else None,
            "destino":      self.vuelo.destino          if self.vuelo    else None,
            "fecha_salida": self.vuelo.fecha_salida.strftime("%Y-%m-%d %H:%M") if self.vuelo else None,
            "pasajero":     f"{self.pasajero.nombre} {self.pasajero.apellido}" if self.pasajero else None,
            "asiento":      self.asiento,
            "clase":        self.clase,
            "estado":       self.estado,
            "precio":       float(self.precio),
            "fecha_reserva": self.fecha_reserva.strftime("%Y-%m-%d %H:%M"),
        }
