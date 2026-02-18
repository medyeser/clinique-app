import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add current directory to path
sys.path.append(os.getcwd())

from models.database import DATABASE_URL
from models.user import User

def check_setup():
    print("--- Vérification de la configuration ---")
    
    # 1. Check Database connection
    print(f"1. Test de connexion à la base de données ({DATABASE_URL})...")
    try:
        engine = create_engine(DATABASE_URL)
        connection = engine.connect()
        print("   ✅ Connexion réussie!")
        connection.close()
    except Exception as e:
        print(f"   ❌ ÉCHEC de la connexion: {e}")
        print("\n   ACTION REQUISE: Assurez-vous que votre serveur MySQL est démarré (via XAMPP/WAMP).")
        return

    # 2. Check Users
    print("\n2. Vérification des utilisateurs...")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        if not users:
            print("   ⚠️ Aucun utilisateur trouvé dans la table 'users'.")
            print("   Vous devez créer un administrateur.")
        else:
            print(f"   ✅ {len(users)} utilisateur(s) trouvé(s):")
            for user in users:
                print(f"      - Username: {user.username}, Role: {user.role}")
                
    except Exception as e:
        print(f"   ❌ Erreur lors de la lecture des utilisateurs: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_setup()
