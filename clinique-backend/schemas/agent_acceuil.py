"""
AgentAcceuil (Reception Agent) schemas for validation and serialization.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date


class AgentAcceuilBase(BaseModel):
    """Base schema for AgentAcceuil."""
    nom: str = Field(..., min_length=1, max_length=100)
    prenom: str = Field(..., min_length=1, max_length=100)
    date_naissance: date
    email: EmailStr
    telephone: Optional[str] = Field(None, max_length=20)
    adresse: Optional[str] = None
    username: str = Field(..., min_length=3, max_length=50)
    date_embauche: date
    role: Optional[str] = Field(None, max_length=100)


class AgentAcceuilCreate(AgentAcceuilBase):
    """Schema for creating a new agent d'acceuil."""
    password: str = Field(..., min_length=6)


class AgentAcceuilUpdate(BaseModel):
    """Schema for updating an agent d'acceuil."""
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    prenom: Optional[str] = Field(None, min_length=1, max_length=100)
    date_naissance: Optional[date] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = Field(None, max_length=20)
    adresse: Optional[str] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=6)
    date_embauche: Optional[date] = None
    role: Optional[str] = Field(None, max_length=100)


class AgentAcceuilResponse(BaseModel):
    """Schema for agent d'acceuil response."""
    id: int
    nom: str
    prenom: str
    date_naissance: date
    email: str
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    username: str
    date_embauche: date
    role: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
