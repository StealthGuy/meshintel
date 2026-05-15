import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Importa questo!
from backend.api.routes import router as api_router

app = FastAPI(title="Meshtastic Network API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# --- SERVING SICURO DEL FRONTEND ---

# 1. Calcoliamo il percorso assoluto e blocchiamolo lì
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_dir = os.path.join(base_dir, "frontend")

# 2. Montiamo SOLO quella cartella. html=True fa sì che capisca da solo index.html
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")