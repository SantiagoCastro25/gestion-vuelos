"""
config.py - Configuración de la aplicación Flask
"""
import os

class Config:
    # ── Base de datos (XAMPP) ──────────────────────────────────────
    # Si tu MySQL tiene contraseña, cámbiala aquí
    DB_USER     = os.getenv("DB_USER",     "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST     = os.getenv("DB_HOST",     "localhost")
    DB_PORT     = os.getenv("DB_PORT",     "3306")
    DB_NAME     = os.getenv("DB_NAME",     "flights_management")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── Flask ──────────────────────────────────────────────────────
    SECRET_KEY  = os.getenv("SECRET_KEY", "flights-secret-key-2026")
    DEBUG       = True
    JSON_SORT_KEYS = False
