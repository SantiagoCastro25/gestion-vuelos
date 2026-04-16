"""
routes/__init__.py - Exporta todos los blueprints
"""
from .flights    import flights_bp
from .passengers import passengers_bp
from .bookings   import bookings_bp
from .crew       import crew_bp

__all__ = ["flights_bp", "passengers_bp", "bookings_bp", "crew_bp"]
