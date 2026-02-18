"""
Patient model for managing patient information.
"""
from sqlalchemy import Column, Integer, String, Date, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base


class SexeEnum(enum.Enum):
    """Enumeration for patient gender."""
    HOMME = "Homme"
    FEMME = "Femme"
    AUTRE = "Autre"


class Patient(Base):
    """Patient model for storing patient information."""
    
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False, index=True)
    prenom = Column(String(100), nullable=False, index=True)
    date_naissance = Column(Date, nullable=False)
    sexe = Column(String(10), nullable=False)
    adresse = Column(String(255))
    telephone = Column(String(20), index=True)
    email = Column(String(100), unique=True, index=True)
    numero_securite_sociale = Column(String(15), unique=True, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=True, index=True)
    created_by_agent_id = Column(Integer, ForeignKey("agents_acceuil.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    medecin = relationship("Medecin", foreign_keys=[medecin_id])
    created_by_agent = relationship("AgentAcceuil", foreign_keys=[created_by_agent_id])
    rendez_vous = relationship("RendezVous", back_populates="patient", cascade="all, delete-orphan")
    dossier_medical = relationship("DossierMedical", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Patient(id={self.id}, nom='{self.nom}', prenom='{self.prenom}')>"
