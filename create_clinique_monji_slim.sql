-- ============================================
-- Script SQL - Clinique Monji Slim
-- Base de données vide avec structure complète
-- Basé sur la structure de clinique_tawfik
-- ============================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS clinique_monji_slim 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE clinique_monji_slim;

-- ============================================
-- Désactiver les vérifications de clés étrangères
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Table: users (Utilisateurs Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'receptionniste',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: medecins (Médecins)
-- ============================================
CREATE TABLE IF NOT EXISTS `medecins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialite` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_ordre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `disponibilites` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_ordre` (`numero_ordre`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_nom` (`nom`),
  KEY `idx_prenom` (`prenom`),
  KEY `idx_specialite` (`specialite`),
  KEY `idx_email` (`email`),
  KEY `idx_numero_ordre` (`numero_ordre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: secretaires (Secrétaires)
-- ============================================
CREATE TABLE IF NOT EXISTS `secretaires` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_embauche` date NOT NULL,
  `role_permissions` text COLLATE utf8mb4_unicode_ci,
  `medecins_assignes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_nom` (`nom`),
  KEY `idx_prenom` (`prenom`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: agents_acceuil (Agents d'Accueil)
-- ============================================
CREATE TABLE IF NOT EXISTS `agents_acceuil` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_embauche` date NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_nom` (`nom`),
  KEY `idx_prenom` (`prenom`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: patients
-- ============================================
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_naissance` date NOT NULL,
  `sexe` enum('Homme','Femme','Autre') COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_securite_sociale` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medecin_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_by_agent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `numero_securite_sociale` (`numero_securite_sociale`),
  KEY `idx_nom` (`nom`),
  KEY `idx_prenom` (`prenom`),
  KEY `idx_telephone` (`telephone`),
  KEY `idx_email` (`email`),
  KEY `idx_numero_ss` (`numero_securite_sociale`),
  KEY `idx_medecin_id` (`medecin_id`),
  KEY `idx_patients_created_by_agent` (`created_by_agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: dossiers_medicaux
-- ============================================
CREATE TABLE IF NOT EXISTS `dossiers_medicaux` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `antecedents_medicaux` text COLLATE utf8mb4_unicode_ci,
  `allergies` text COLLATE utf8mb4_unicode_ci,
  `groupe_sanguin` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `historique_consultations` text COLLATE utf8mb4_unicode_ci,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `traitements` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_groupe_sanguin` (`groupe_sanguin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: rendez_vous
-- ============================================
CREATE TABLE IF NOT EXISTS `rendez_vous` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_heure` datetime NOT NULL,
  `patient_id` int(11) NOT NULL,
  `medecin_id` int(11) NOT NULL,
  `statut` enum('Planifié','Confirmé','Annulé','Terminé') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Planifié',
  `motif` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_date_heure` (`date_heure`),
  KEY `idx_patient_id` (`patient_id`),
  KEY `idx_medecin_id` (`medecin_id`),
  KEY `idx_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: consultations
-- ============================================
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dossier_id` int(11) DEFAULT NULL,
  `medecin_id` int(11) DEFAULT NULL,
  `date_creation` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `antecedents_medicaux` text,
  `allergies` text,
  `traitements` text,
  `titre` varchar(255) DEFAULT NULL,
  `observation` text,
  `createur` varchar(100) DEFAULT NULL,
  `tarif` float DEFAULT '0',
  `paiement_type` varchar(50) DEFAULT 'Personnel',
  PRIMARY KEY (`id`),
  KEY `dossier_id` (`dossier_id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `ix_consultations_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: paiements
-- ============================================
CREATE TABLE IF NOT EXISTS `paiements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `montant` float NOT NULL,
  `date_paiement` datetime DEFAULT NULL,
  `medecin_id` int(11) DEFAULT NULL,
  `patient_id` int(11) DEFAULT NULL,
  `methode` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `commentaire` text,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `medecin_id` (`medecin_id`),
  KEY `patient_id` (`patient_id`),
  KEY `ix_paiements_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: contrats
-- ============================================
CREATE TABLE IF NOT EXISTS `contrats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom_employe` varchar(100) NOT NULL,
  `poste` varchar(100) NOT NULL,
  `type_contrat` varchar(50) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `salaire` float NOT NULL,
  `missions` text NOT NULL,
  `horaires` varchar(200) NOT NULL,
  `statut_contrat` varchar(50) DEFAULT 'Brouillon',
  `signature_employeur` datetime DEFAULT NULL,
  `signature_employe` datetime DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: acces (Téléchargements de logiciels)
-- ============================================
CREATE TABLE IF NOT EXISTS `acces` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nom_logiciel` VARCHAR(255) NOT NULL,
    `version` VARCHAR(50) NOT NULL,
    `url_telechargement` TEXT NOT NULL,
    `description` TEXT,
    `actif` TINYINT(1) DEFAULT 1 NOT NULL,
    `date_creation` DATETIME DEFAULT NULL,
    `date_modification` DATETIME DEFAULT NULL,
    INDEX idx_nom_logiciel (nom_logiciel),
    INDEX idx_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Ajouter les contraintes de clés étrangères
-- ============================================

-- Contraintes pour patients
ALTER TABLE `patients`
  ADD CONSTRAINT `fk_patients_medecin_monji` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_patient_created_by_agent_monji` FOREIGN KEY (`created_by_agent_id`) REFERENCES `agents_acceuil` (`id`) ON DELETE SET NULL;

-- Contraintes pour dossiers_medicaux
ALTER TABLE `dossiers_medicaux`
  ADD CONSTRAINT `dossiers_medicaux_ibfk_1_monji` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

-- Contraintes pour rendez_vous
ALTER TABLE `rendez_vous`
  ADD CONSTRAINT `rendez_vous_ibfk_1_monji` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rendez_vous_ibfk_2_monji` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE CASCADE;

-- Contraintes pour consultations
ALTER TABLE `consultations`
  ADD CONSTRAINT `consultations_ibfk_1_monji` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers_medicaux` (`id`),
  ADD CONSTRAINT `consultations_ibfk_2_monji` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`);

-- Contraintes pour paiements
ALTER TABLE `paiements`
  ADD CONSTRAINT `paiements_ibfk_1_monji` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`),
  ADD CONSTRAINT `paiements_ibfk_2_monji` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

-- ============================================
-- Réactiver les vérifications de clés étrangères
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Insertion d'un utilisateur admin par défaut
-- ============================================
-- Mot de passe: admin123
INSERT INTO `users` (`username`, `email`, `hashed_password`, `role`, `is_active`, `created_at`) VALUES
('admin', 'admin@monjislim.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MV5rHe', 'admin', 1, NOW());

-- ============================================
-- Vérification
-- ============================================
SELECT 
    'Base de données Clinique Monji Slim créée avec succès!' AS message,
    (SELECT COUNT(*) FROM users) AS nb_users,
    (SELECT COUNT(*) FROM patients) AS nb_patients,
    (SELECT COUNT(*) FROM medecins) AS nb_medecins,
    (SELECT COUNT(*) FROM secretaires) AS nb_secretaires,
    (SELECT COUNT(*) FROM agents_acceuil) AS nb_agents;

SHOW TABLES;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Pour utiliser ce script:
-- 1. Ouvrir MySQL Workbench ou phpMyAdmin
-- 2. Cliquer sur l'onglet "SQL"
-- 3. Copier-coller ce script complet
-- 4. Cliquer sur "Exécuter"
-- 
-- Connexion admin:
-- Username: admin
-- Password: admin123
-- Email: admin@monjislim.com
-- ============================================
