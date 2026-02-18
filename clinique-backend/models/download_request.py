"""
Model for managing download requests with admin approval.
"""
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import random
from .database import Base


class DownloadRequest(Base):
    """
    DownloadRequest model for managing software download requests.
    Users submit requests, admins approve/reject, and approved users receive access codes.
    """
    __tablename__ = "download_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    clinique_id = Column(String(50), nullable=False)  # 'monji-slim' or 'tawfik'
    database_name = Column(String(100), nullable=False)  # Mapped database name
    status = Column(
        Enum('pending', 'approved', 'rejected', name='request_status'),
        default='pending',
        nullable=False,
        index=True
    )
    access_code = Column(String(6), nullable=True, index=True)
    code_expires_at = Column(DateTime, nullable=True)
    approved_by_user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    downloaded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationship to User (admin who approved)
    approved_by = relationship("User", foreign_keys=[approved_by_user_id])

    def generate_access_code(self, expiration_hours: int = 24) -> str:
        """
        Generate a random 6-digit access code and set expiration time.
        
        Args:
            expiration_hours: Number of hours until code expires (default: 24)
            
        Returns:
            The generated 6-digit code as a string
        """
        self.access_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        self.code_expires_at = datetime.now() + timedelta(hours=expiration_hours)
        return self.access_code

    def is_code_valid(self) -> bool:
        """
        Check if the access code is still valid (not expired and not already used).
        
        Returns:
            True if code is valid, False otherwise
        """
        if not self.access_code or not self.code_expires_at:
            return False
        
        # Check if code has expired
        if datetime.now() > self.code_expires_at:
            return False
        
        # Check if already downloaded
        if self.downloaded_at is not None:
            return False
        
        return True

    def mark_as_downloaded(self):
        """Mark this request as downloaded."""
        self.downloaded_at = datetime.now()

    @staticmethod
    def map_clinic_to_database(clinique_id: str) -> str:
        """
        Map clinic ID to database name.
        
        Args:
            clinique_id: The clinic identifier ('monji-slim' or 'tawfik')
            
        Returns:
            The corresponding database name
        """
        clinic_mapping = {
            'monji-slim': 'clinique_monji_slim',
            'tawfik': 'clinique_db'
        }
        return clinic_mapping.get(clinique_id, 'clinique_db')  # Default to clinique_db

    def __repr__(self):
        return f"<DownloadRequest(id={self.id}, email='{self.email}', status='{self.status}', clinique='{self.clinique_id}')>"
