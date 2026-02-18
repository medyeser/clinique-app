"""
Model for managing software download access.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base


class Acces(Base):
    """
    Acces model for managing software download permissions.
    """
    __tablename__ = "acces"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nom_logiciel = Column(String(255), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    url_telechargement = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    actif = Column(Boolean, default=True, nullable=False)
    date_creation = Column(DateTime, default=func.now())
    date_modification = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Acces(id={self.id}, nom_logiciel='{self.nom_logiciel}', version='{self.version}')>"
