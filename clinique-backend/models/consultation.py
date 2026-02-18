from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from models.database import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    dossier_id = Column(Integer, ForeignKey("dossiers_medicaux.id"))
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=True) # Optional, linked to logged in user if possible
    
    date_creation = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Snapshot of the form data at the time of consultation
    antecedents_medicaux = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    traitements = Column(Text, nullable=True)
    
    # Specific observation for this file
    titre = Column(String(255), nullable=True)
    observation = Column(Text, nullable=True)
    
    # Creator info
    createur = Column(String(100), nullable=True) # Username of the creator

    dossier = relationship("DossierMedical", back_populates="consultations")
    medecin = relationship("Medecin")
