/**
 * Médecins Page - CRUD operations for doctors
 */
import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Stethoscope,
    Phone,
    Mail
} from 'lucide-react';
import { medecinsAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Medecins.css';

const Medecins = () => {
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingMedecin, setEditingMedecin] = useState(null);
    const [selectedMedecin, setSelectedMedecin] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        specialite: '',
        telephone: '',
        email: '',
        numero_ordre: '',
        disponibilites: '',
        password: '',
        confirmPassword: ''
    });

    const specialites = [
        'Médecine Générale',
        'Cardiologie',
        'Dermatologie',
        'Pédiatrie',
        'Gynécologie',
        'Ophtalmologie',
        'ORL',
        'Neurologie',
        'Psychiatrie',
        'Rhumatologie',
        'Chirurgie',
        'Radiologie'
    ];

    useEffect(() => {
        fetchMedecins();
    }, []);

    // Live search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchMedecins = async () => {
        try {
            const response = await medecinsAPI.getAll();
            setMedecins(response.data);
        } catch (error) {
            console.error('Error fetching medecins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchMedecins();
            return;
        }
        try {
            const response = await medecinsAPI.search(searchQuery);
            setMedecins(response.data);
        } catch (error) {
            console.error('Error searching medecins:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            if (editingMedecin) {
                await medecinsAPI.update(editingMedecin.id, formData);
            } else {
                await medecinsAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            fetchMedecins();
        } catch (error) {
            console.error('Error saving medecin:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (medecin) => {
        // Stop propagation to avoid opening details modal
        setEditingMedecin(medecin);
        setFormData({
            nom: medecin.nom || '',
            prenom: medecin.prenom || '',
            specialite: medecin.specialite || '',
            telephone: medecin.telephone || '',
            email: medecin.email || '',
            email: medecin.email || '',
            numero_ordre: medecin.numero_ordre || '',
            disponibilites: medecin.disponibilites || '',
            password: '',
            confirmPassword: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Stop propagation
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) return;
        try {
            await medecinsAPI.delete(id);
            fetchMedecins();
        } catch (error) {
            console.error('Error deleting medecin:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleCardClick = (medecin) => {
        setSelectedMedecin(medecin);
        setShowDetailsModal(true);
    };

    const resetForm = () => {
        setEditingMedecin(null);
        setFormData({
            nom: '',
            prenom: '',
            specialite: '',
            telephone: '',
            email: '',
            numero_ordre: '',
            disponibilites: '',
            password: '',
            confirmPassword: ''
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
        <div className="medecins-page">
            <div className="page-header">
                <h1>Gestion des Médecins</h1>
                <div className="page-header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un médecin..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button className="button" type="button" onClick={openAddModal}>
                        <span className="button__text">Nouveau Médecin</span>
                        <span className="button__icon">
                            <Plus className="svg" />
                        </span>
                    </button>
                </div>
            </div>

            {/* Doctors Grid */}
            <div className="medecins-grid">
                {medecins.length === 0 ? (
                    <div className="card">
                        <div className="card-body">
                            <div className="empty-state">
                                <Stethoscope size={48} />
                                <h3 className="text-xl font-semibold mb-2">Aucun médecin</h3>
                                <p className="text-gray-500">Commencez par ajouter un nouveau médecin</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    medecins.map((medecin) => (
                        <div
                            key={medecin.id}
                            className="medecin-card card hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleCardClick(medecin)}
                        >
                            <div className="medecin-header">
                                <div className="medecin-avatar">
                                    <Stethoscope size={24} />
                                </div>
                                <div className="medecin-actions">
                                    <button
                                        className="btn btn-icon btn-secondary"
                                        onClick={(e) => { e.stopPropagation(); handleEdit(medecin); }}
                                        title="Modifier"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn btn-icon btn-danger"
                                        onClick={(e) => handleDelete(e, medecin.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="medecin-body">
                                <h3>Dr. {medecin.prenom} {medecin.nom}</h3>
                                <span className="badge badge-success">{medecin.specialite}</span>
                                <div className="medecin-contact">
                                    {medecin.telephone && (
                                        <span><Phone size={14} /> {medecin.telephone}</span>
                                    )}
                                    {medecin.email && (
                                        <span><Mail size={14} /> {medecin.email}</span>
                                    )}
                                </div>
                                {medecin.numero_ordre && (
                                    <p className="medecin-ordre">N° Ordre: {medecin.numero_ordre}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingMedecin ? 'Modifier le médecin' : 'Nouveau médecin'}
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
                            <label className="form-label">Spécialité *</label>
                            <select
                                className="form-select"
                                value={formData.specialite}
                                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                                required
                            >
                                <option value="">Sélectionner une spécialité</option>
                                {specialites.map((spec) => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">N° Ordre *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.numero_ordre}
                                onChange={(e) => setFormData({ ...formData, numero_ordre: e.target.value })}
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
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Disponibilités</label>
                            <textarea
                                className="form-textarea"
                                value={formData.disponibilites}
                                onChange={(e) => setFormData({ ...formData, disponibilites: e.target.value })}
                                placeholder="Ex: Lundi-Vendredi 9h-18h"
                            />
                        </div>

                        {/* Password Fields */}
                        <div className="form-group">
                            <label className="form-label">Mot de passe {!editingMedecin && '*'}</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder={editingMedecin ? "Laisser vide si inchangé" : "Mot de passe"}
                                required={!editingMedecin}
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirmer le mot de passe {!editingMedecin && '*'}</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirmer le mot de passe"
                                required={!editingMedecin || (formData.password && formData.password.length > 0)}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingMedecin ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title={selectedMedecin ? `Dr. ${selectedMedecin.prenom} ${selectedMedecin.nom}` : 'Détails du Médecin'}
                size="md"
            >
                {selectedMedecin && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Stethoscope size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Dr. {selectedMedecin.prenom} {selectedMedecin.nom}</h3>
                                <p className="text-blue-600 font-medium">{selectedMedecin.specialite}</p>
                                <p className="text-gray-500 text-sm mt-1">N° Ordre: {selectedMedecin.numero_ordre || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Coordonnées</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        <span>{selectedMedecin.telephone || 'Non renseigné'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        <span>{selectedMedecin.email || 'Non renseigné'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">Disponibilités</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                    {selectedMedecin.disponibilites || 'Aucune disponibilité renseignée.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                            <button
                                className="w-full btn btn-primary flex items-center justify-center gap-2"
                                onClick={() => {
                                    // Navigate to RDV page filtered by this doctor
                                    window.location.href = `/rendez-vous?medecin_id=${selectedMedecin.id}`;
                                }}
                            >
                                <span>📅 Voir les rendez-vous</span>
                            </button>
                            <button
                                className="w-full btn btn-secondary flex items-center justify-center gap-2"
                                onClick={() => {
                                    // Navigate to Dashboard or show stats modal? 
                                    // User asked for "Voir statistiques". Dashboard has them.
                                    // Let's redirect to dashboard which shows stats.
                                    window.location.href = '/dashboard';
                                }}
                            >
                                <span>📊 Voir les statistiques</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Medecins;
