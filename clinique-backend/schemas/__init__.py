"""
Schemas package for Pydantic models.
"""
from .user import UserCreate, UserLogin, UserResponse, Token, TokenData
from .patient import PatientCreate, PatientUpdate, PatientResponse
from .medecin import MedecinCreate, MedecinUpdate, MedecinResponse
from .rendez_vous import RendezVousCreate, RendezVousUpdate, RendezVousResponse, ConflitCheck
from .dossier_medical import DossierMedicalCreate, DossierMedicalUpdate, DossierMedicalResponse
from .secretaire import SecretaireCreate, SecretaireUpdate, SecretaireResponse
from .agent_acceuil import AgentAcceuilCreate, AgentAcceuilUpdate, AgentAcceuilResponse

__all__ = [
    "UserCreate", "UserLogin", "UserResponse", "Token", "TokenData",
    "PatientCreate", "PatientUpdate", "PatientResponse",
    "MedecinCreate", "MedecinUpdate", "MedecinResponse",
    "RendezVousCreate", "RendezVousUpdate", "RendezVousResponse", "ConflitCheck",
    "DossierMedicalCreate", "DossierMedicalUpdate", "DossierMedicalResponse",
    "SecretaireCreate", "SecretaireUpdate", "SecretaireResponse",
    "AgentAcceuilCreate", "AgentAcceuilUpdate", "AgentAcceuilResponse",
]
