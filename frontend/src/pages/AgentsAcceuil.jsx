/**
 * Agents d'Acceuil Page - CRUD operations for reception agents
 */
import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    User
} from 'lucide-react';
import { agentsAcceuilAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './AgentsAcceuil.css';

const AgentsAcceuil = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
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
        role: ''
    });

    useEffect(() => {
        fetchAgents();
    }, []);

    // Live search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchAgents = async () => {
        try {
            const response = await agentsAcceuilAPI.getAll();
            setAgents(response.data);
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchAgents();
            return;
        }
        try {
            const response = await agentsAcceuilAPI.search(searchQuery);
            setAgents(response.data);
        } catch (error) {
            console.error('Error searching agents:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean and format data before sending
            const cleanData = {
                ...formData,
                // Clean empty strings to null for optional fields
                telephone: formData.telephone?.trim() === '' ? null : formData.telephone,
                adresse: formData.adresse?.trim() === '' ? null : formData.adresse,
            };

            // Remove password if editing and password is empty
            if (editingAgent && !cleanData.password) {
                delete cleanData.password;
            }

            if (editingAgent) {
                await agentsAcceuilAPI.update(editingAgent.id, cleanData);
            } else {
                await agentsAcceuilAPI.create(cleanData);
            }
            setShowModal(false);
            resetForm();
            fetchAgents();
        } catch (error) {
            console.error('Error saving agent:', error);
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
                    errorMessage = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            alert('Erreur lors de la sauvegarde: ' + errorMessage);
        }
    };

    const handleEdit = (agent) => {
        setEditingAgent(agent);
        setFormData({
            nom: agent.nom || '',
            prenom: agent.prenom || '',
            date_naissance: agent.date_naissance || '',
            email: agent.email || '',
            telephone: agent.telephone || '',
            adresse: agent.adresse || '',
            username: agent.username || '',
            password: '', // Don't prefill password
            date_embauche: agent.date_embauche || '',
            role: agent.role || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (e, id) => {
        if (e) e.stopPropagation();
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent d\'acceuil ?')) return;
        try {
            await agentsAcceuilAPI.delete(id);
            fetchAgents();
        } catch (error) {
            console.error('Error deleting agent:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setEditingAgent(null);
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
            role: ''
        });
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="agents-page">
            <div className="page-header">
                <h1>Gestion des Agents d'Acceuil</h1>
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
                        <span className="button__text">Nouvel Agent</span>
                        <span className="button__icon">
                            <Plus className="svg" />
                        </span>
                    </button>
                </div>
            </div>

            {/* Agents Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>Contact</th>
                                <th>Date d'embauche</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <Users size={48} />
                                            <h3>Aucun agent d'acceuil</h3>
                                            <p>Commencez par ajouter un nouvel agent</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                agents.map((agent) => (
                                    <tr key={agent.id}>
                                        <td>
                                            <div className="patient-info">
                                                <div className="patient-avatar">
                                                    {agent.prenom?.charAt(0)}{agent.nom?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="patient-name">
                                                        {agent.prenom} {agent.nom}
                                                    </span>
                                                    <span className="patient-ssn">
                                                        @{agent.username}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                {agent.telephone && (
                                                    <span><Phone size={14} /> {agent.telephone}</span>
                                                )}
                                                {agent.email && (
                                                    <span><Mail size={14} /> {agent.email}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {agent.date_embauche && (
                                                <span className="date-cell">
                                                    <CalendarIcon size={14} />
                                                    {new Date(agent.date_embauche).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-success">
                                                {agent.role || 'Agent d\'acceuil'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-icon btn-secondary"
                                                    onClick={() => handleEdit(agent)}
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-icon btn-danger"
                                                    onClick={() => handleDelete(null, agent.id)}
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
                title={editingAgent ? 'Modifier l\'agent d\'acceuil' : 'Nouvel agent d\'acceuil'}
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
                                Mot de passe {editingAgent ? '(laisser vide pour ne pas changer)' : '*'}
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingAgent}
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
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                            >
                                <option value="">Sélectionner un rôle</option>
                                <option value="Secrétaire">Secrétaire</option>
                                <option value="Agent d'acceuil">Agent d'acceuil</option>
                                <option value="RH">RH</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingAgent ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AgentsAcceuil;
