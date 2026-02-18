"""
Service for sending emails using EmailJS.
EmailJS is a client-side email service, but we'll provide the data structure
that the frontend will use to send emails.
"""
import os
from typing import Dict, Any


class EmailService:
    """
    Email service for sending access codes via EmailJS.
    Note: EmailJS is typically used on the frontend, so this service
    provides the data structure and logging for backend tracking.
    """
    
    @staticmethod
    def get_access_code_email_data(
        to_email: str,
        prenom: str,
        nom: str,
        access_code: str,
        clinique_name: str
    ) -> Dict[str, Any]:
        """
        Prepare email data for sending access code via EmailJS.
        
        Args:
            to_email: Recipient email address
            prenom: User's first name
            nom: User's last name
            access_code: 6-digit access code
            clinique_name: Name of the clinic
            
        Returns:
            Dictionary with email template data for EmailJS
        """
        return {
            "to_email": to_email,
            "to_name": f"{prenom} {nom}",
            "prenom": prenom,
            "access_code": access_code,
            "clinique_name": clinique_name,
            "subject": "Votre code d'accès pour télécharger le logiciel",
            "message": f"""
Bonjour {prenom},

Votre demande de téléchargement pour {clinique_name} a été approuvée !

Voici votre code d'accès à 6 chiffres :

{access_code}

Ce code est valide pendant 24 heures. Utilisez-le sur la page de vérification pour télécharger le logiciel.

Cordialement,
L'équipe de gestion des cliniques
            """.strip()
        }
    
    @staticmethod
    def log_email_sent(to_email: str, access_code: str):
        """
        Log email sending for debugging purposes.
        
        Args:
            to_email: Recipient email
            access_code: Access code sent
        """
        print(f"📧 Email envoyé à {to_email}")
        print(f"🔑 Code d'accès: {access_code}")
        print(f"⏰ Valide pendant 24 heures")
        print("-" * 50)


# For testing purposes, we can also provide a console-based email sender
def send_access_code_email_console(
    email: str,
    prenom: str,
    nom: str,
    access_code: str,
    clinique_name: str
):
    """
    Console-based email sender for testing (when EmailJS is not available).
    
    Args:
        email: Recipient email
        prenom: User's first name
        nom: User's last name
        access_code: 6-digit access code
        clinique_name: Clinic name
    """
    print("\n" + "=" * 60)
    print("📧 EMAIL DE TEST - CODE D'ACCÈS")
    print("=" * 60)
    print(f"À: {email}")
    print(f"Nom: {prenom} {nom}")
    print(f"Clinique: {clinique_name}")
    print(f"\n🔑 CODE D'ACCÈS: {access_code}")
    print(f"\nCe code est valide pendant 24 heures.")
    print("=" * 60 + "\n")
