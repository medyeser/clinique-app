"""
Script to create the download_requests table in the database.
"""
import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_download_requests_table():
    """Create the download_requests table."""
    try:
        # Connect to MySQL
        connection = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'clinique_db'),
            charset='utf8mb4'
        )
        
        print(f"✅ Connecté à la base de données: {os.getenv('MYSQL_DATABASE')}")
        
        cursor = connection.cursor()
        
        # Read SQL file
        with open('create_download_requests_table.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Execute SQL
        cursor.execute(sql_script)
        connection.commit()
        
        print("✅ Table 'download_requests' créée avec succès!")
        
        # Verify table creation
        cursor.execute("SHOW TABLES LIKE 'download_requests'")
        result = cursor.fetchone()
        
        if result:
            print("✅ Vérification: La table existe dans la base de données")
            
            # Show table structure
            cursor.execute("DESCRIBE download_requests")
            columns = cursor.fetchall()
            print("\n📋 Structure de la table:")
            for col in columns:
                print(f"   - {col[0]} ({col[1]})")
        else:
            print("❌ Erreur: La table n'a pas été créée")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de la table: {str(e)}")
        raise

if __name__ == "__main__":
    create_download_requests_table()
