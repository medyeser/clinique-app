# Guide Rapide - Créer la Table Accès

## ✅ Le backend démarre maintenant!

J'ai temporairement désactivé le module "Accès" pour permettre au backend de démarrer.

## 📋 Pour activer la page Accès

### Étape 1: Créer la table dans MySQL

Ouvrez **MySQL Workbench** ou **phpMyAdmin** et exécutez ce SQL:

```sql
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Étape 2: Décommenter le code

Une fois la table créée, décommentez ces lignes:

#### Dans `routes/acces.py` (ligne 11-12):
```python
# Remplacer:
# from models.acces import Acces

# Par:
from models.acces import Acces
```

#### Dans `main.py` (ligne 22):
```python
# Remplacer:
from routes import auth, patients, medecins, rendez_vous, dossiers, rapports, consultations, secretaires, agents_acceuil, secretaires_dashboard, medecin_dashboard, contrats, revenus  # , acces

# Par:
from routes import auth, patients, medecins, rendez_vous, dossiers, rapports, consultations, secretaires, agents_acceuil, secretaires_dashboard, medecin_dashboard, contrats, revenus, acces
```

#### Dans `main.py` (ligne 115):
```python
# Remplacer:
# app.include_router(acces.router)  # TEMPORAIRE: Décommenté après création de la table

# Par:
app.include_router(acces.router)
```

### Étape 3: Redémarrer le backend

Arrêtez et redémarrez le backend:
```bash
# Ctrl+C pour arrêter
python main.py
```

## 🎉 C'est tout!

La page Accès sera alors disponible dans le menu admin.
