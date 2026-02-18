"""
Medecin (Doctor) model for managing doctor information.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Medecin(Base):
    """Medecin model for storing doctor information."""
    
    __tablename__ = "medecins"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False, index=True)
    prenom = Column(String(100), nullable=False, index=True)
    specialite = Column(String(100), nullable=False, index=True)
    telephone = Column(String(20))
    email = Column(String(100), unique=True, index=True)
    numero_ordre = Column(String(50), unique=True, index=True)  # Medical license number
    disponibilites = Column(Text)  # JSON string for availability schedule
    hashed_password = Column(String(255), nullable=True) # Password for direct login
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    rendez_vous = relationship("RendezVous", back_populates="medecin", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Medecin(id={self.id}, nom='{self.nom}', prenom='{self.prenom}', specialite='{self.specialite}')>"
