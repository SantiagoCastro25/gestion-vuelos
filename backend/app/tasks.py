"""
tasks.py - Tareas programadas en segundo plano
"""
from datetime import datetime
from app.database import db
from app.models import Vuelo, Reserva

def update_real_time_status(app):
    """
    Actualiza el estado de los vuelos y las reservas automáticamente.
    (Requiere correr dentro del app_context).
    """
    with app.app_context():
        now = datetime.now()
        
        # 1. Solo evaluamos vuelos que NO estén cancelados manual o previamente
        vuelos = Vuelo.query.filter(Vuelo.estado != 'cancelado').all()
        for vuelo in vuelos:
            nuevo_estado = vuelo.estado
            
            # Comparar el tiempo actual con salida y llegada
            if now < vuelo.fecha_salida:
                # Si falta más de 1 hora
                diff_seconds = (vuelo.fecha_salida - now).total_seconds()
                if diff_seconds > 3600:
                    nuevo_estado = 'programado'
                else:
                    nuevo_estado = 'embarcando'
            elif now >= vuelo.fecha_salida and now < vuelo.fecha_llegada:
                nuevo_estado = 'en_vuelo'
            elif now >= vuelo.fecha_llegada:
                nuevo_estado = 'aterrizado'
                
            # Si hubo un cambio de estado en el tiempo real
            if nuevo_estado != vuelo.estado:
                vuelo.estado = nuevo_estado
                
                # 2. Lógica para reservas según estados
                # Si el vuelo ya está embarcando o volando o aterrizó, las reservas pendientes se cancelan (Time is up)
                if nuevo_estado in ['embarcando', 'en_vuelo', 'aterrizado']:
                    reservas_pendientes = Reserva.query.filter_by(vuelo_id=vuelo.id, estado='pendiente').all()
                    for rp in reservas_pendientes:
                        rp.estado = 'cancelada'
                        vuelo.asientos_disponibles = min(vuelo.asientos_disponibles + 1, vuelo.capacidad)
                        
                # Si aterrizó, las reservas confirmadas se completan
                if nuevo_estado == 'aterrizado':
                    reservas_confirmadas = Reserva.query.filter_by(vuelo_id=vuelo.id, estado='confirmada').all()
                    for rc in reservas_confirmadas:
                        rc.estado = 'completada'

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error en tarea update_real_time_status: {e}")
