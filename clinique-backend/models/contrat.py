"""
Contrat model for managing employment contracts.
"""
from sqlalchemy import Column, Integer, String, Date, Float, Text, DateTime, TIMESTAMP
from sqlalchemy.sql import func
from .database import Base

class Contrat(Base):
    """Contrat model for storing employment contract information."""
    __tablename__ = "contrats"

    id = Column(Integer, primary_key=True, index=True)
    nom_employe = Column(String(100), nullable=False)
    poste = Column(String(100), nullable=False)
    type_contrat = Column(String(50), nullable=False)  # CDD, CDI, Stage
    date_debut = Column(Date, nullable=False)
    date_fin = Column(Date, nullable=False)  # Mandatory
    salaire = Column(Float, nullable=False)
    missions = Column(Text, nullable=False)
    horaires = Column(String(200), nullable=False)
    
    # New fields as requested
    statut_contrat = Column(String(50), default="Brouillon") 
    signature_employeur = Column(DateTime, nullable=True)
    signature_employe = Column(DateTime, nullable=True)
    
    date_creation = Column(TIMESTAMP, server_default=func.now())

    def __repr__(self):
        return f"<Contrat(id={self.id}, nom='{self.nom_employe}', poste='{self.poste}')>"
