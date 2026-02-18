-- phpMyAdmin SQL Dump
-- version 3.3.9.2
-- http://www.phpmyadmin.net
--
-- Serveur: 127.0.0.1
-- Généré le : Ven 02 Janvier 2026 à 02:46
-- Version du serveur: 5.5.10
-- Version de PHP: 5.3.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données: `clinique_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `agents_acceuil`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=3 ;

--
-- Contenu de la table `agents_acceuil`
--

INSERT INTO `agents_acceuil` (`id`, `nom`, `prenom`, `date_naissance`, `email`, `telephone`, `adresse`, `username`, `hashed_password`, `date_embauche`, `role`, `created_at`, `updated_at`) VALUES
(1, 'titi ', 'riahi', '2003-01-28', 'rmedyesser6@gmail.com', '12345678', 'tuniiis ', 'titii', '$2b$12$GswWTqLm7h2EvoyfAitiAunRY3pPiDlkOVqkaD8nccQHh2MVza6lm', '2025-12-12', 'Agent d''acceuil', NULL, NULL),
(2, 'Dupont', 'Marie', '1995-05-15', 'agent@example.com', '0612345678', '123 Rue de la Clinique, Paris', 'agent_marie', '$2b$12$kN/cWJt2X0PbrP.RXjw1Lukcc6jwTSSbD6nqmow.zccwZnY9hmL/O', '2025-12-13', 'Agent d''Accueil', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `consultations`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Contenu de la table `consultations`
--

INSERT INTO `consultations` (`id`, `dossier_id`, `medecin_id`, `date_creation`, `updated_at`, `antecedents_medicaux`, `allergies`, `traitements`, `titre`, `observation`, `createur`, `tarif`, `paiement_type`) VALUES
(1, 4, NULL, '2025-12-10 02:40:49', '2025-12-10 02:57:12', 'mrith', 'mahboul', 'firalgon', 'marth khtiiir ', 'riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004riahi med yesser 1782004', 'yesser', 0, 'Personnel'),
(2, 4, NULL, '2025-12-10 03:04:51', '2025-12-10 03:04:51', 'sissi', 'tartaraa', 'doliprane', 'abaaab', 'el lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliiiel lob ya hliliii', 'yesser', 0, 'Personnel'),
(3, 4, NULL, '2025-12-11 15:09:05', '2025-12-12 04:15:41', 'bbbbbbb', 'aaaaaaa', 'gggggggg', '+-', 'rriahiii med yesse rriahiii med yesse rriahiii med yesse rriahiii med yesse rriahiii med yesse rriahiii med yesse rriahiii med yesse v', 'yesser', 0, 'Personnel'),
(7, 8, NULL, '2025-12-12 04:19:46', '2025-12-12 04:19:46', 'zzzzzzzzzzzz', 'zzzzzzzz', 'zzzzzzzzzzz', 'mrgl', 'aqszqdxera', 'gesmi omar (Secrétaire)', 0, 'Personnel'),
(8, 11, NULL, '2025-12-13 03:29:53', '2025-12-13 03:29:53', 'aaaaaaaaaaaa', 'aaaaaaaaa', 'aaaaaaaaaaaaa', 'aaaaaaaa', 'aaaaaaaaaaaaaaaaaaaa', 'riahi yesser (Secrétaire)', 0, 'Personnel');

-- --------------------------------------------------------

--
-- Structure de la table `contrats`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Contenu de la table `contrats`
--

INSERT INTO `contrats` (`id`, `nom_employe`, `poste`, `type_contrat`, `date_debut`, `date_fin`, `salaire`, `missions`, `horaires`, `statut_contrat`, `signature_employeur`, `signature_employe`, `date_creation`) VALUES
(1, 'yesser riahi', 'ginicologe', 'CDD', '2025-12-12', '2026-12-12', 2.5, 'Assurer les consultations médicales des patients conformément aux normes professionnelles en vigueur.\nÉtablir les diagnostics, proposer et suivre les traitements adaptés.\nMettre à jour les dossiers médicaux des patients après chaque consultation.\nRespecter strictement la confidentialité des données médicales.\nCollaborer avec le personnel administratif pour assurer une bonne organisation des soins.', '35h/semaine', 'Validé', '2025-12-12 09:00:00', '2025-12-12 09:00:00', '2025-12-17 00:52:23');

-- --------------------------------------------------------

--
-- Structure de la table `dossiers_medicaux`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=12 ;

--
-- Contenu de la table `dossiers_medicaux`
--

INSERT INTO `dossiers_medicaux` (`id`, `patient_id`, `antecedents_medicaux`, `allergies`, `groupe_sanguin`, `historique_consultations`, `observations`, `traitements`, `created_at`, `updated_at`) VALUES
(4, 4, 'aaaa', 'vivre ', 'A+', '[{"date": "2025-12-10T00:49:52.075000+00:00", "observation": "tretment", "medecin": "yesser"}, {"date": "2025-12-10T01:01:30.909000+00:00", "observation": "alergie", "medecin": "yesser"}, {"date": "2025-12-10T01:24:23.855000+00:00", "titre": null, "observation": "aaaa", "medecin": "yesser"}, {"date": "2025-12-10T01:24:47.112000+00:00", "titre": null, "observation": "bbbb", "medecin": "yesser"}]', 'med yesser riahi', 'panadole ', NULL, '2025-12-10 02:36:34'),
(8, 9, NULL, NULL, 'B+', NULL, NULL, NULL, NULL, '2025-12-12 04:19:46'),
(9, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 10, NULL, NULL, 'A-', NULL, NULL, NULL, NULL, '2025-12-13 03:29:53');

-- --------------------------------------------------------

--
-- Structure de la table `medecins`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=6 ;

--
-- Contenu de la table `medecins`
--

INSERT INTO `medecins` (`id`, `nom`, `prenom`, `specialite`, `telephone`, `email`, `numero_ordre`, `disponibilites`, `created_at`, `updated_at`, `hashed_password`) VALUES
(4, 'yesser', 'riahi', 'Cardiologie', '96421260', 'hamouu@gmail.com', '12', 'lundi 12-16', NULL, '2025-12-16 00:38:01', '$2b$12$MjkuBD87reIIR9/PYce3oeK4d/jfkHQRdc2rVGxHs/1VgnmKd81Aa'),
(5, 'maryem', 'riahi', 'Médecine Générale', '123456789', 'maryem@gmail.com', '15', 'lundi15-18', NULL, '2025-12-16 00:38:27', '$2b$12$EIOi9KJij6PJqoEkPD0lXevwf/FDSoTEQzzuDgmrD/wEj8H8xC3sa');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

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
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Contenu de la table `paiements`
--


-- --------------------------------------------------------

--
-- Structure de la table `patients`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=13 ;

--
-- Contenu de la table `patients`
--

INSERT INTO `patients` (`id`, `nom`, `prenom`, `date_naissance`, `sexe`, `adresse`, `telephone`, `email`, `numero_securite_sociale`, `medecin_id`, `created_at`, `updated_at`, `created_by_agent_id`) VALUES
(4, 'yesser', 'riahi', '2002-12-31', 'Homme', 'tunis', '96421260', 'hamou@gmail.com', '10', 4, NULL, '2025-12-12 01:52:37', NULL),
(9, 'el naa', 'el naa', '1995-09-04', 'Homme', 'tounes', '147896325', 'aaa@gmail.com', '12', 4, NULL, NULL, NULL),
(10, 'amin', 'riahi', '1998-06-20', 'Homme', 'tunis', '12345698', 'amin@gmail.com', '120', 5, NULL, NULL, 1),
(11, 'aaaa', 'aaaaa', '2020-12-20', 'Homme', 'aaaaaaaaaa', '12345678', 'aaaaa@gmail.com', NULL, 5, NULL, NULL, NULL),
(12, 'tttt', 'ttttt', '2002-12-12', 'Homme', 'aaaaaaa', '1212211212', '122121@gmail.com', '121212', 5, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `rendez_vous`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=14 ;

--
-- Contenu de la table `rendez_vous`
--

INSERT INTO `rendez_vous` (`id`, `date_heure`, `patient_id`, `medecin_id`, `statut`, `motif`, `notes`, `created_at`, `updated_at`) VALUES
(9, '2026-01-12 09:30:00', 4, 4, 'Confirmé', 'aaaaaaaaaaaa', 'zzzzzzzzzzzzzzzzz', NULL, '2025-12-11 16:17:37'),
(12, '2025-12-12 09:00:00', 12, 4, 'Confirmé', 'aaaaaa', 'aaaaaaaa', NULL, '2025-12-13 03:28:26'),
(13, '2025-12-14 10:00:00', 11, 5, 'Annulé', 'aaaaaa', 'aaaaaaaaa', NULL, '2025-12-13 03:34:32');

-- --------------------------------------------------------

--
-- Structure de la table `secretaires`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=3 ;

--
-- Contenu de la table `secretaires`
--

INSERT INTO `secretaires` (`id`, `nom`, `prenom`, `date_naissance`, `email`, `telephone`, `adresse`, `username`, `hashed_password`, `date_embauche`, `role_permissions`, `medecins_assignes`, `created_at`, `updated_at`) VALUES
(1, 'yesser', 'riahi', '2004-01-28', 'hamou@gmail.com', '12345678', 'tunis', 'hamou', '$2b$12$5xhJdSVfw/RyhrTjikNJU.sPLEli4tyL882y.wmARs4AjTgp.dbXu', '2025-12-12', 'Secrétaire', '[5]', NULL, '2025-12-12 02:17:10'),
(2, 'omar', 'gesmi', '2006-02-21', 'omar@gmail.com', '12345698', 'beja', 'omar', '$2b$12$/W9rzqOyuxA9RaFptHyuxe4yEr2/vuOkLpOjC7598tz2ppTODa9rW', '2025-12-12', 'Secrétaire', '[4, 5]', NULL, '2025-12-16 14:36:06');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=9 ;

--
-- Contenu de la table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `hashed_password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@clinique.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MV5rHe', 'admin', 1, NULL, NULL),
(2, 'yesser', 'yesser@gmail.com', '$2b$12$JGXtz6FXJfXOOvaKJI2ZseygZ81GOuy.RgF.4e3HFSbLrsAp7QMeO', 'admin', 1, '2025-12-09 22:45:09', '2025-12-10 00:27:37'),
(3, 'hamou', 'hamou@gmail.com', '$2b$12$6A6nVRutJlxVLGrxSS/es.l7wPMwwV1pymDQrVSJglmY3a3s0ElsC', 'medecin', 1, NULL, NULL),
(4, 'maryem', 'maryem@gmail.com', '$2b$12$.Y3PZT0cFlzHKvnDRkGYP.cPcp/O0TcMeIuNCEcMsD7qj5Ik2WqY2', 'medecin', 1, NULL, '2025-12-16 00:38:27'),
(5, 'hamouu', 'hamouu@gmail.com', '$2b$12$fS4B2mtIyB72ZjKJ73EYVeg58HPLccUiKhl3YCudzWFm4AbMyJkSe', 'medecin', 1, NULL, '2025-12-16 00:38:01'),
(6, 'aaaaaaaa', 'aaaaaaaa@gmail.com', '$2b$12$7Hq6Pa1RQgQxIjod.dGieuETx3HDG96G40fTlSNw0wNymfCjKCghG', 'medecin', 1, NULL, NULL),
(7, 'aaaa', 'aaaa@gmail.com', '$2b$12$.Sy3cZ5DxOJCBtB4u0Y9gO3Gi3Q3B0A69H8PV7boS0FPYLG6IOq36', 'medecin', 1, NULL, NULL),
(8, 'aaaaaaaaa', 'aaaaaaaaa@gmail.com', '$2b$12$aI7IRxk0Za4MsNGDLfnc2.TUmw3RLO1.w7Ck1xAXq/3DSku4BhBqy', 'medecin', 1, NULL, NULL);

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `consultations`
--
ALTER TABLE `consultations`
  ADD CONSTRAINT `consultations_ibfk_1` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers_medicaux` (`id`),
  ADD CONSTRAINT `consultations_ibfk_2` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`);

--
-- Contraintes pour la table `dossiers_medicaux`
--
ALTER TABLE `dossiers_medicaux`
  ADD CONSTRAINT `dossiers_medicaux_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `paiements_ibfk_1` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`),
  ADD CONSTRAINT `paiements_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

--
-- Contraintes pour la table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `fk_patients_medecin` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_patient_created_by_agent` FOREIGN KEY (`created_by_agent_id`) REFERENCES `agents_acceuil` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  ADD CONSTRAINT `rendez_vous_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rendez_vous_ibfk_2` FOREIGN KEY (`medecin_id`) REFERENCES `medecins` (`id`) ON DELETE CASCADE;
