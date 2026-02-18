"""
Script d'initialisation de la base de données.
Crée les tables et un utilisateur admin par défaut.
"""
import sys
from models.database import create_tables, SessionLocal
from models.user import User
from services.auth_service import get_password_hash


def init_database():
    """Initialize database with tables and default admin user."""
    print("🔧 Initialisation de la base de données...")
    
    # Create tables
    try:
        create_tables()
        print("✅ Tables créées avec succès")
    except Exception as e:
        print(f"❌ Erreur lors de la création des tables: {e}")
        sys.exit(1)
    
    # Create default admin user
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("ℹ️  Utilisateur admin existe déjà")
        else:
            admin = User(
                username="admin",
                email="admin@clinique.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Utilisateur admin créé")
            print("   Username: admin")
            print("   Password: admin123")
            print("   ⚠️  Changez ce mot de passe en production!")
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'admin: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("\n✅ Initialisation terminée!")
    print("\n📝 Prochaines étapes:")
    print("1. Démarrer l'API: uvicorn main:app --reload")
    print("2. Accéder à la documentation: http://localhost:8000/docs")
    print("3. Se connecter avec admin/admin123")


if __name__ == "__main__":
    init_database()
