"""
Script pour réinitialiser le mot de passe admin
"""
import bcrypt
import pymysql

# Configuration de la base de données
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Mettez votre mot de passe MySQL ici si nécessaire
    'database': 'clinique_db'
}

# Générer le hash bcrypt pour le mot de passe "yesser"
password = "yesser"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"Hash bcrypt pour '{password}': {hashed.decode('utf-8')}")

try:
    # Connexion à la base de données
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()
    
    # Vérifier si le compte existe
    cursor.execute("SELECT id, username, email, role FROM users WHERE email = 'yesser@gmail.com' OR username = 'yesser'")
    user = cursor.fetchone()
    
    if user:
        print(f"\nCompte trouvé: ID={user[0]}, Username={user[1]}, Email={user[2]}, Role={user[3]}")
        
        # Mettre à jour le mot de passe
        cursor.execute(
            "UPDATE users SET hashed_password = %s, is_active = 1 WHERE email = 'yesser@gmail.com' OR username = 'yesser'",
            (hashed.decode('utf-8'),)
        )
        connection.commit()
        print("✅ Mot de passe mis à jour avec succès!")
        
        # Vérifier la mise à jour
        cursor.execute("SELECT username, email, role, is_active FROM users WHERE email = 'yesser@gmail.com' OR username = 'yesser'")
        updated_user = cursor.fetchone()
        print(f"Compte après mise à jour: Username={updated_user[0]}, Email={updated_user[1]}, Role={updated_user[2]}, Active={updated_user[3]}")
        
    else:
        print("\n❌ Compte non trouvé. Création du compte...")
        cursor.execute(
            """INSERT INTO users (username, email, hashed_password, role, is_active, created_at)
               VALUES ('yesser', 'yesser@gmail.com', %s, 'admin', 1, NOW())""",
            (hashed.decode('utf-8'),)
        )
        connection.commit()
        print("✅ Compte créé avec succès!")
    
    cursor.close()
    connection.close()
    
    print("\n🔑 Identifiants de connexion:")
    print("Email/Username: yesser@gmail.com ou yesser")
    print("Mot de passe: yesser")
    
except Exception as e:
    print(f"\n❌ Erreur: {e}")
