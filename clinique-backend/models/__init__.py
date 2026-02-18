"""
Models package for the medical clinic management system.
"""
from .database import Base, engine, SessionLocal, get_db
from .user import User
from .patient import Patient
from .medecin import Medecin
from .rendez_vous import RendezVous
from .dossier_medical import DossierMedical
from .secretaire import Secretaire
from .agent_acceuil import AgentAcceuil

__all__ = [
    "Base",
    "engine",
    "SessionLocal",
    "get_db",
    "User",
    "Patient",
    "Medecin",
    "RendezVous",
    "DossierMedical",
    "Secretaire",
    "AgentAcceuil",
]
