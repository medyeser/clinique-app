"""
AgentAcceuil (Reception Agent) model for managing reception agent information.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Date
from sqlalchemy.sql import func
from .database import Base


class AgentAcceuil(Base):
    """AgentAcceuil model for storing reception agent information."""
    
    __tablename__ = "agents_acceuil"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False, index=True)
    prenom = Column(String(100), nullable=False, index=True)
    date_naissance = Column(Date, nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    telephone = Column(String(20))
    adresse = Column(Text)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    date_embauche = Column(Date, nullable=False)
    role = Column(String(100))  # Role description
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))
    
    def __repr__(self):
        return f"<AgentAcceuil(id={self.id}, nom='{self.nom}', prenom='{self.prenom}')>"
