-- ============================================
-- Script SQL - Gestion Clinique Médicale
-- Base de données: clinique_db
-- Compatible avec toutes versions MySQL
-- ============================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS clinique_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE clinique_db;

-- ============================================
-- Supprimer les tables existantes (si besoin)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS dossiers_medicaux;
DROP TABLE IF EXISTS rendez_vous;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS medecins;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Table: users (Utilisateurs)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'receptionniste',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: patients
-- ============================================
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    sexe ENUM('Homme', 'Femme', 'Autre') NOT NULL,
    adresse VARCHAR(255) NULL,
    telephone VARCHAR(20) NULL,
    email VARCHAR(100) NULL UNIQUE,
    numero_securite_sociale VARCHAR(15) NULL UNIQUE,
    medecin_id INT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    
    FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE SET NULL,
    
    INDEX idx_nom (nom),
    INDEX idx_prenom (prenom),
    INDEX idx_telephone (telephone),
    INDEX idx_email (email),
    INDEX idx_numero_ss (numero_securite_sociale),
    INDEX idx_medecin_id (medecin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: medecins
-- ============================================
CREATE TABLE medecins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    specialite VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NULL,
    email VARCHAR(100) NULL UNIQUE,
    numero_ordre VARCHAR(50) NOT NULL UNIQUE,
    disponibilites TEXT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    
    INDEX idx_nom (nom),
    INDEX idx_prenom (prenom),
    INDEX idx_specialite (specialite),
    INDEX idx_email (email),
    INDEX idx_numero_ordre (numero_ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: rendez_vous
-- ============================================
CREATE TABLE rendez_vous (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_heure DATETIME NOT NULL,
    patient_id INT NOT NULL,
    medecin_id INT NOT NULL,
    statut ENUM('Planifié', 'Confirmé', 'Annulé', 'Terminé') NOT NULL DEFAULT 'Planifié',
    motif VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE,
    
    INDEX idx_date_heure (date_heure),
    INDEX idx_patient_id (patient_id),
    INDEX idx_medecin_id (medecin_id),
    INDEX idx_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: dossiers_medicaux
-- ============================================
CREATE TABLE dossiers_medicaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL UNIQUE,
    antecedents_medicaux TEXT NULL,
    allergies TEXT NULL,
    groupe_sanguin VARCHAR(5) NULL,
    historique_consultations TEXT NULL,
    observations TEXT NULL,
    traitements TEXT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_groupe_sanguin (groupe_sanguin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insertion de données de test
-- ============================================

-- Utilisateur admin par défaut
INSERT INTO users (username, email, hashed_password, role, is_active, created_at) VALUES
('admin', 'admin@clinique.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MV5rHe', 'admin', 1, NOW());
-- Mot de passe: admin123

-- Patients de test
INSERT INTO patients (nom, prenom, date_naissance, sexe, adresse, telephone, email, numero_securite_sociale, created_at) VALUES
('Dupont', 'Marie', '1985-03-15', 'Femme', '123 Rue de Paris, 75001 Paris', '0612345678', 'marie.dupont@email.com', '285031234567890', NOW()),
('Martin', 'Jean', '1978-07-22', 'Homme', '45 Avenue des Champs, 75008 Paris', '0698765432', 'jean.martin@email.com', '178072234567891', NOW()),
('Bernard', 'Sophie', '1992-11-08', 'Femme', '78 Boulevard Saint-Michel, 75005 Paris', '0623456789', 'sophie.bernard@email.com', '292111234567892', NOW());

-- Médecins de test
INSERT INTO medecins (nom, prenom, specialite, telephone, email, numero_ordre, disponibilites, created_at) VALUES
('Lefebvre', 'Dr. Pierre', 'Cardiologie', '0145678901', 'dr.lefebvre@clinique.com', 'CARD12345', '{"lundi": "9h-17h", "mardi": "9h-17h", "mercredi": "9h-17h"}', NOW()),
('Moreau', 'Dr. Claire', 'Pédiatrie', '0156789012', 'dr.moreau@clinique.com', 'PEDI67890', '{"lundi": "10h-18h", "jeudi": "10h-18h", "vendredi": "10h-18h"}', NOW()),
('Dubois', 'Dr. Marc', 'Dermatologie', '0167890123', 'dr.dubois@clinique.com', 'DERM54321', '{"mardi": "8h-16h", "mercredi": "8h-16h", "jeudi": "8h-16h"}', NOW());

-- Rendez-vous de test
INSERT INTO rendez_vous (date_heure, patient_id, medecin_id, statut, motif, notes, created_at) VALUES
('2024-12-15 10:00:00', 1, 1, 'Confirmé', 'Consultation cardiologie', 'Premier rendez-vous', NOW()),
('2024-12-15 14:30:00', 2, 2, 'Planifié', 'Consultation pédiatrique', 'Contrôle annuel', NOW()),
('2024-12-16 09:00:00', 3, 3, 'Planifié', 'Consultation dermatologie', 'Problème de peau', NOW());

-- Dossiers médicaux de test
INSERT INTO dossiers_medicaux (patient_id, antecedents_medicaux, allergies, groupe_sanguin, observations, traitements, created_at) VALUES
(1, 'Hypertension familiale', 'Pénicilline', 'A+', 'Patiente en bonne santé générale', 'Traitement antihypertenseur', NOW()),
(2, 'Asthme léger', 'Pollen', 'O+', 'Asthme bien contrôlé', 'Ventoline en cas de crise', NOW()),
(3, 'Aucun', 'Aucune', 'B+', 'Aucune observation particulière', 'Aucun traitement en cours', NOW());

-- ============================================
-- Vérification des tables créées
-- ============================================
SELECT 
    'Tables créées avec succès!' AS message,
    (SELECT COUNT(*) FROM users) AS nb_users,
    (SELECT COUNT(*) FROM patients) AS nb_patients,
    (SELECT COUNT(*) FROM medecins) AS nb_medecins,
    (SELECT COUNT(*) FROM rendez_vous) AS nb_rendez_vous,
    (SELECT COUNT(*) FROM dossiers_medicaux) AS nb_dossiers;

-- ============================================
-- Afficher la structure des tables
-- ============================================
SHOW TABLES;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Pour utiliser ce script:
-- 1. Ouvrir phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Cliquer sur l'onglet "SQL"
-- 3. Copier-coller ce script complet
-- 4. Cliquer sur "Exécuter"
-- 
-- Note: Les timestamps (created_at, updated_at) seront gérés
-- automatiquement par SQLAlchemy dans l'application Python
-- ============================================
