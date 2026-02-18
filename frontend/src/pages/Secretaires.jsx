/**
 * Secrétaires Page - CRUD operations for secretaries
 */
import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    UserCheck,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    User
} from 'lucide-react';
import { secretairesAPI, medecinsAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Secretaires.css';

const Secretaires = () => {
    const [secretaires, setSecretaires] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSecretaire, setEditingSecretaire] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        date_naissance: '',
        email: '',
        telephone: '',
        adresse: '',
        username: '',
        password: '',
        date_embauche: '',
        role_permissions: '',
        medecins_assignes: []
    });

    useEffect(() => {
        fetchSecretaires();
        fetchMedecins();
    }, []);

    // Live search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchSecretaires = async () => {
        try {
            const response = await secretairesAPI.getAll();
            setSecretaires(response.data);
        } catch (error) {
            console.error('Error fetching secretaires:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedecins = async () => {
        try {
            const response = await medecinsAPI.getAll();
            setMedecins(response.data);
        } catch (error) {
            console.error('Error fetching medecins:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchSecretaires();
            return;
        }
        try {
            const response = await secretairesAPI.search(searchQuery);
            setSecretaires(response.data);
        } catch (error) {
            console.error('Error searching secretaires:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean and format data before sending
            const cleanData = {
                ...formData,
                // Ensure medecins_assignes is an array of integers
                medecins_assignes: Array.isArray(formData.medecins_assignes) 
                    ? formData.medecins_assignes.map(id => parseInt(id)).filter(id => !isNaN(id))
                    : [],
                // Clean empty strings to null for optional fields
                telephone: formData.telephone?.trim() === '' ? null : formData.telephone,
                adresse: formData.adresse?.trim() === '' ? null : formData.adresse,
            };

            // Remove password if editing and password is empty
            if (editingSecretaire && !cleanData.password) {
                delete cleanData.password;
            }

            if (editingSecretaire) {
                await secretairesAPI.update(editingSecretaire.id, cleanData);
            } else {
                await secretairesAPI.create(cleanData);
            }
            setShowModal(false);
            resetForm();
            fetchSecretaires();
        } catch (error) {
            console.error('Error saving secretaire:', error);
            // Better error message handling
            let errorMessage = 'Erreur inconnue';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else {
                    // If it's an object, try to stringify it properly
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            alert('Erreur lors de la sauvegarde: ' + errorMessage);
        }
    };

    const handleEdit = (secretaire) => {
        setEditingSecretaire(secretaire);
        // Ensure medecins_assignes is an array of integers
        const medecinsIds = secretaire.medecins_assignes 
            ? (Array.isArray(secretaire.medecins_assignes) 
                ? secretaire.medecins_assignes.map(id => parseInt(id)).filter(id => !isNaN(id))
                : [])
            : [];
        
        setFormData({
            nom: secretaire.nom || '',
            prenom: secretaire.prenom || '',
            date_naissance: secretaire.date_naissance || '',
            email: secretaire.email || '',
            telephone: secretaire.telephone || '',
            adresse: secretaire.adresse || '',
            username: secretaire.username || '',
            password: '', // Don't prefill password
            date_embauche: secretaire.date_embauche || '',
            role_permissions: secretaire.role_permissions || '',
            medecins_assignes: medecinsIds
        });
        setShowModal(true);
    };

    const handleDelete = async (e, id) => {
        if (e) e.stopPropagation();
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce secrétaire ?')) return;
        try {
            await secretairesAPI.delete(id);
            fetchSecretaires();
        } catch (error) {
            console.error('Error deleting secretaire:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setEditingSecretaire(null);
        setFormData({
            nom: '',
            prenom: '',
            date_naissance: '',
            email: '',
            telephone: '',
            adresse: '',
            username: '',
            password: '',
            date_embauche: '',
            role_permissions: '',
            medecins_assignes: []
        });
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleMedecinToggle = (medecinId) => {
        setFormData(prev => {
            const isSelected = prev.medecins_assignes.includes(medecinId);
            return {
                ...prev,
                medecins_assignes: isSelected
                    ? prev.medecins_assignes.filter(id => id !== medecinId)
                    : [...prev.medecins_assignes, medecinId]
            };
        });
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="secretaires-page">
            <div className="page-header">
                <h1>Gestion des Secrétaires</h1>
                <div className="page-header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher (nom, téléphone...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="btn btn-secondary" onClick={handleSearch} style={{ marginLeft: '8px', padding: '0.5rem 1rem' }}>
                            <Search size={18} />
                        </button>
                    </div>
                    <button className="button" type="button" onClick={openAddModal}>
                        <span className="button__text">Nouveau Secrétaire</span>
                        <span className="button__icon">
                            <Plus className="svg" />
                        </span>
                    </button>
                </div>
            </div>

            {/* Secretaires Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Secrétaire</th>
                                <th>Contact</th>
                                <th>Date d'embauche</th>
                                <th>Rôle</th>
                                <th>Médecins assignés</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {secretaires.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <UserCheck size={48} />
                                            <h3>Aucun secrétaire</h3>
                                            <p>Commencez par ajouter un nouveau secrétaire</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                secretaires.map((secretaire) => (
                                    <tr key={secretaire.id}>
                                        <td>
                                            <div className="patient-info">
                                                <div className="patient-avatar">
                                                    {secretaire.prenom?.charAt(0)}{secretaire.nom?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="patient-name">
                                                        {secretaire.prenom} {secretaire.nom}
                                                    </span>
                                                    <span className="patient-ssn">
                                                        @{secretaire.username}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                {secretaire.telephone && (
                                                    <span><Phone size={14} /> {secretaire.telephone}</span>
                                                )}
                                                {secretaire.email && (
                                                    <span><Mail size={14} /> {secretaire.email}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {secretaire.date_embauche && (
                                                <span className="date-cell">
                                                    <CalendarIcon size={14} />
                                                    {new Date(secretaire.date_embauche).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-info">
                                                {secretaire.role_permissions || 'Secrétaire'}
                                            </span>
                                        </td>
                                        <td>
                                            {secretaire.medecins_assignes && secretaire.medecins_assignes.length > 0 ? (
                                                <span className="badge badge-primary">
                                                    {secretaire.medecins_assignes.length} médecin(s)
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">Aucun</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-icon btn-secondary"
                                                    onClick={() => handleEdit(secretaire)}
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-icon btn-danger"
                                                    onClick={() => handleDelete(null, secretaire.id)}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSecretaire ? 'Modifier le secrétaire' : 'Nouveau secrétaire'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nom *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prénom *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.prenom}
                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date de naissance *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date_naissance}
                                onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Téléphone</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.telephone}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Adresse</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.adresse}
                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nom d'utilisateur *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Mot de passe {editingSecretaire ? '(laisser vide pour ne pas changer)' : '*'}
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingSecretaire}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date d'embauche *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date_embauche}
                                onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Rôle *</label>
                            <select
                                className="form-select"
                                value={formData.role_permissions}
                                onChange={(e) => setFormData({ ...formData, role_permissions: e.target.value })}
                                required
                            >
                                <option value="">Sélectionner un rôle</option>
                                <option value="Secrétaire">Secrétaire</option>
                                <option value="Agent d'acceuil">Agent d'acceuil</option>
                                <option value="RH">RH</option>
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Médecins assignés</label>
                            <div className="medecins-checkbox-list">
                                {medecins.map((medecin) => (
                                    <label key={medecin.id} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.medecins_assignes.includes(medecin.id)}
                                            onChange={() => handleMedecinToggle(medecin.id)}
                                        />
                                        <span>Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingSecretaire ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Secretaires;
