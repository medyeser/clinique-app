-- Script SQL pour créer la table 'download_requests'
-- Gestion des demandes de téléchargement avec approbation admin
-- Compatible MySQL 5.5+

CREATE TABLE IF NOT EXISTS download_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    clinique_id VARCHAR(50) NOT NULL,
    database_name VARCHAR(100) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
    access_code VARCHAR(6) DEFAULT NULL,
    code_expires_at DATETIME DEFAULT NULL,
    approved_by_user_id INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    downloaded_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT NULL,
    updated_at DATETIME DEFAULT NULL,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_access_code (access_code),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
