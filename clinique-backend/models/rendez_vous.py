"""
RendezVous (Appointment) model for managing appointments.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base


class StatutRendezVous(enum.Enum):
    """Enumeration for appointment status."""
    PLANIFIE = "Planifié"
    CONFIRME = "Confirmé"
    ANNULE = "Annulé"
    TERMINE = "Terminé"


class RendezVous(Base):
    """RendezVous model for storing appointment information."""
    
    __tablename__ = "rendez_vous"
    
    id = Column(Integer, primary_key=True, index=True)
    date_heure = Column(DateTime, nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False, index=True)
    statut = Column(String(20), nullable=False, default="Planifié")
    motif = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="rendez_vous")
    medecin = relationship("Medecin", back_populates="rendez_vous")
    
    def __repr__(self):
        return f"<RendezVous(id={self.id}, date_heure='{self.date_heure}', statut='{self.statut.value}')>"
