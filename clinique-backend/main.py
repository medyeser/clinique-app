"""
Main FastAPI application for the medical clinic management system.
"""
import sys
import io

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from fastapi import FastAPI, Request, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import traceback

from models.database import create_tables
from models.consultation import Consultation # Import to ensure table creation
from add_admin import add_yesser_admin
from routes import auth, patients, medecins, rendez_vous, dossiers, rapports, consultations, secretaires, agents_acceuil, secretaires_dashboard, medecin_dashboard, contrats, revenus, download_requests  # , acces


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup: Create database tables
    print(" Starting Medical Clinic API...")
    create_tables()
    print(" Database tables created/verified")
    
    yield
    
    print(" Shutting down Medical Clinic API...")


# Create FastAPI application
app = FastAPI(
    title="API Gestion Clinique Médicale",
    description="API REST pour la gestion d'une clinique médicale - Patients, Médecins, Rendez-vous, Dossiers Médicaux",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security Imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Rate Limiter Configuration
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

# Configure CORS - Must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:8080", 
        "http://localhost:3000", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:8080",
        "https://gestion-clinique-04.netlify.app"
    ],  # Frontend origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Serve static files for downloads
import os
downloads_path = os.path.join(os.path.dirname(__file__), "downloads")
if not os.path.exists(downloads_path):
    os.makedirs(downloads_path)
app.mount("/downloads", StaticFiles(directory=downloads_path), name="downloads")

# Add Security Middlewares
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Global exception handler to ensure CORS headers are always present
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are always present."""
    print(f"Unhandled exception: {str(exc)}")
    print(traceback.format_exc())
    origin = request.headers.get("origin") or "http://localhost:5173"
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    )


# Include routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(medecins.router)
app.include_router(rendez_vous.router)
app.include_router(dossiers.router)
app.include_router(rapports.router)
app.include_router(consultations.router)
app.include_router(secretaires.router)
app.include_router(agents_acceuil.router)
app.include_router(secretaires_dashboard.router)
app.include_router(medecin_dashboard.router)
app.include_router(contrats.router)
app.include_router(revenus.router)
app.include_router(download_requests.router)
# app.include_router(acces.router)  # TEMPORAIRE: Décommenté après création de la table


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "Bienvenue sur l'API de Gestion de Clinique Médicale",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "patients": "/api/patients",
            "medecins": "/api/medecins",
            "rendez_vous": "/api/rendez-vous",
            "dossiers": "/api/dossiers",
            "rapports": "/api/rapports",
            "secretaires": "/api/secretaires",
            "agents_acceuil": "/api/agents-acceuil",
            "medecin_dashboard": "/api/medecin/dashboard",
            "contrats": "/api/contrats",
            "acces": "/api/acces"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Medical Clinic API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
