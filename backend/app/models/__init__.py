"""
models/__init__.py - Exporta todos los modelos
"""
from .flight    import Vuelo
from .passenger import Pasajero
from .booking   import Reserva
from .crew      import Tripulacion

__all__ = ["Vuelo", "Pasajero", "Reserva", "Tripulacion"]
