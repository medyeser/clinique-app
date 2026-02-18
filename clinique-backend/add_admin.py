"""
Script to add the yesser admin user to the database.
"""
from models.database import SessionLocal
from models.user import User
from services.auth_service import get_password_hash

def add_yesser_admin():
    """Add yesser admin user to the database."""
    db = SessionLocal()
    try:
        # Check if yesser already exists
        existing_user = db.query(User).filter(User.email == "yesser@gmail.com").first()
        if existing_user:
            print("ℹ️  Utilisateur yesser existe déjà, mise à jour du mot de passe...")
            existing_user.hashed_password = get_password_hash("yesser1234")
            db.commit()
            print("✅ Mot de passe mis à jour")
            return

        # Create yesser admin user
        yesser = User(
            username="yesser",
            email="yesser@gmail.com",
            hashed_password=get_password_hash("yesser1234"),
            role="admin",
            is_active=True
        )
        db.add(yesser)
        db.commit()
        print("✅ Utilisateur yesser admin créé")
        print("   Email: yesser@gmail.com")
        print("   Password: yesser1234")
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'utilisateur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_yesser_admin()
