"""
run.py - Punto de entrada de la aplicación Flask
Ejecutar con: python run.py
"""
from app import create_app

app = create_app()

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    print("=" * 50)
    print("[AeroGest] Flight Management API")
    print("   http://localhost:5000")
    print("   http://localhost:5000/api/health")
    print("=" * 50)
    app.run(debug=True, host="0.0.0.0", port=5000)
