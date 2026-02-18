"""
Script pour créer manuellement la table 'acces' dans MySQL.
Utilise une requête SQL brute pour éviter les problèmes de compatibilité SQLAlchemy.
"""
from sqlalchemy import text
from models.database import engine

def create_acces_table():
    """Crée la table acces en utilisant SQL brut."""
    
    # SQL pour créer la table
    create_table_sql = text("""
    CREATE TABLE IF NOT EXISTS acces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom_logiciel VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        url_telechargement TEXT NOT NULL,
        description TEXT,
        actif TINYINT(1) DEFAULT 1 NOT NULL,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_nom_logiciel (nom_logiciel),
        INDEX idx_actif (actif)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    
    try:
        # Exécuter la requête SQL brute
        with engine.connect() as connection:
            connection.execute(create_table_sql)
            connection.commit()
        print("✅ Table 'acces' créée avec succès!")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la création de la table: {e}")
        return False

if __name__ == "__main__":
    create_acces_table()
