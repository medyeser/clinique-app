-- Script SQL pour créer la table 'acces'
-- Gestion des accès de téléchargement de logiciels
-- Compatible MySQL 5.5

CREATE TABLE IF NOT EXISTS acces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_logiciel VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    url_telechargement TEXT NOT NULL,
    description TEXT,
    actif TINYINT(1) DEFAULT 1 NOT NULL,
    date_creation DATETIME DEFAULT NULL,
    date_modification DATETIME DEFAULT NULL,
    INDEX idx_nom_logiciel (nom_logiciel),
    INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données d'exemple (optionnel)
INSERT INTO acces (nom_logiciel, version, url_telechargement, description, actif, date_creation, date_modification) VALUES
('Logiciel Clinique Desktop', '1.0.0', 'https://example.com/download/clinique-v1.0.0.exe', 'Application de bureau pour la gestion de la clinique', 1, NOW(), NOW()),
('Module de Facturation', '2.1.3', 'https://example.com/download/facturation-v2.1.3.zip', 'Module complémentaire pour la gestion de la facturation', 1, NOW(), NOW());
