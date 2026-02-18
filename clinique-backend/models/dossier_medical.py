"""
DossierMedical (Medical Record) model for managing patient medical records.
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class DossierMedical(Base):
    """DossierMedical model for storing patient medical records."""
    
    __tablename__ = "dossiers_medicaux"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, unique=True, index=True)
    antecedents_medicaux = Column(Text)  # Medical history
    allergies = Column(Text)  # Allergies
    groupe_sanguin = Column(String(5))  # Blood type (A+, B-, O+, etc.)
    historique_consultations = Column(Text)  # JSON string for consultation history
    observations = Column(Text)  # Current observations
    traitements = Column(Text)  # Current treatments
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="dossier_medical")
    consultations = relationship("Consultation", back_populates="dossier", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DossierMedical(id={self.id}, patient_id={self.patient_id})>"
