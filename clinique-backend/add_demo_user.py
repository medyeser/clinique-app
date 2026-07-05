"""
Script to add a demo user to the database.
"""
import sys
import os

# Ensure the backend directory is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.database import SessionLocal
from models.user import User
from models.consultation import Consultation # Import to ensure relationships are resolved
from services.auth_service import get_password_hash

def add_demo_user():
    """Add demo user to the database."""
    db = SessionLocal()
    try:
        # Check if demo already exists
        existing_user = db.query(User).filter(User.email == "demo").first()
        if existing_user:
            print("Utilisateur demo existe deja, mise a jour du mot de passe...")
            existing_user.hashed_password = get_password_hash("demo1234")
            db.commit()
            print("Mot de passe mis a jour pour l'utilisateur demo")
            return


        # Create demo user (using 'demo' as email to match the request, though it's technically not an email format, the login might just use the email field for the username depending on how it's set up)
        demo_user = User(
            username="demo",
            email="demo",
            hashed_password=get_password_hash("demo1234"),
            role="admin", # giving admin role so they can test everything
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        print("Utilisateur demo cree")
        print("   Email (Identifiant): demo")
        print("   Password: demo1234")
    except Exception as e:
        print(f"Erreur lors de la creation de l'utilisateur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_demo_user()
