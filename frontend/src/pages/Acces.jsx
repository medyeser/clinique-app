/**
 * Acces Page - Manage software download access
 */
import { useState, useEffect } from 'react';
import {
    Download,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    CheckCircle,
    XCircle,
    ExternalLink
} from 'lucide-react';
import { accesAPI } from '../services/api';
import Loading from '../components/Loading';
import './Acces.css';

const Acces = () => {
    const [accesList, setAccesList] = useState([]);
    const [filteredAcces, setFilteredAcces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAcces, setEditingAcces] = useState(null);
    const [formData, setFormData] = useState({
        nom_logiciel: '',
        version: '',
        url_telechargement: '',
        description: '',
        actif: true
    });

    useEffect(() => {
        fetchAcces();
    }, []);

    useEffect(() => {
        filterAcces();
    }, [searchQuery, accesList]);

    const fetchAcces = async () => {
        try {
            setLoading(true);
            const response = await accesAPI.getAll();
            setAccesList(response.data);
        } catch (error) {
            console.error('Error fetching acces:', error);
            alert('Erreur lors du chargement des accès');
        } finally {
            setLoading(false);
        }
    };

    const filterAcces = () => {
        if (!searchQuery.trim()) {
            setFilteredAcces(accesList);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = accesList.filter(acces =>
            acces.nom_logiciel.toLowerCase().includes(query) ||
            acces.version.toLowerCase().includes(query) ||
            (acces.description && acces.description.toLowerCase().includes(query))
        );
        setFilteredAcces(filtered);
    };

    const handleOpenModal = (acces = null) => {
        if (acces) {
            setEditingAcces(acces);
            setFormData({
                nom_logiciel: acces.nom_logiciel,
                version: acces.version,
                url_telechargement: acces.url_telechargement,
                description: acces.description || '',
                actif: acces.actif
            });
        } else {
            setEditingAcces(null);
            setFormData({
                nom_logiciel: '',
                version: '',
                url_telechargement: '',
                description: '',
                actif: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAcces(null);
        setFormData({
            nom_logiciel: '',
            version: '',
            url_telechargement: '',
            description: '',
            actif: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingAcces) {
                await accesAPI.update(editingAcces.id, formData);
                alert('Accès modifié avec succès');
            } else {
                await accesAPI.create(formData);
                alert('Accès créé avec succès');
            }
            handleCloseModal();
            fetchAcces();
        } catch (error) {
            console.error('Error saving acces:', error);
            alert('Erreur lors de l\'enregistrement de l\'accès');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet accès ?')) {
            return;
        }

        try {
            await accesAPI.delete(id);
            alert('Accès supprimé avec succès');
            fetchAcces();
        } catch (error) {
            console.error('Error deleting acces:', error);
            alert('Erreur lors de la suppression de l\'accès');
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="acces-page">
            <div className="page-header">
                <div>
                    <h1><Download size={28} /> Accès Téléchargements</h1>
                    <p className="page-subtitle">Gérer les accès aux téléchargements de logiciels</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    Nouvel Accès
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-section">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom de logiciel, version..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Acces Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Logiciel</th>
                                    <th>Version</th>
                                    <th>URL</th>
                                    <th>Description</th>
                                    <th className="text-center">Statut</th>
                                    <th className="text-center">Date Création</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAcces.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted">
                                            {searchQuery ? 'Aucun accès trouvé' : 'Aucun accès enregistré'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAcces.map((acces) => (
                                        <tr key={acces.id}>
                                            <td className="font-medium">{acces.nom_logiciel}</td>
                                            <td>
                                                <span className="badge badge-info">{acces.version}</span>
                                            </td>
                                            <td>
                                                <a
                                                    href={acces.url_telechargement}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="download-link"
                                                >
                                                    <ExternalLink size={16} />
                                                    Télécharger
                                                </a>
                                            </td>
                                            <td className="text-muted text-sm">
                                                {acces.description ? (
                                                    acces.description.length > 50
                                                        ? acces.description.substring(0, 50) + '...'
                                                        : acces.description
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {acces.actif ? (
                                                    <span className="status-badge active">
                                                        <CheckCircle size={16} />
                                                        Actif
                                                    </span>
                                                ) : (
                                                    <span className="status-badge inactive">
                                                        <XCircle size={16} />
                                                        Inactif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-center text-sm text-muted">
                                                {new Date(acces.date_creation).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleOpenModal(acces)}
                                                        title="Modifier"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDelete(acces.id)}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingAcces ? 'Modifier l\'Accès' : 'Nouvel Accès'}</h2>
                            <button className="btn-close" onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="nom_logiciel">
                                        Nom du Logiciel <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="nom_logiciel"
                                        className="form-control"
                                        value={formData.nom_logiciel}
                                        onChange={(e) => setFormData({ ...formData, nom_logiciel: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="version">
                                        Version <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="version"
                                        className="form-control"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="url_telechargement">
                                        URL de Téléchargement <span className="required">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        id="url_telechargement"
                                        className="form-control"
                                        value={formData.url_telechargement}
                                        onChange={(e) => setFormData({ ...formData, url_telechargement: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        className="form-control"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.actif}
                                            onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        />
                                        <span>Actif</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingAcces ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Acces;
