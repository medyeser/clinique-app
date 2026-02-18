/**
 * Secretaire Dossiers Page - Full medical records management for secretaries
 */
import { useState, useEffect } from 'react';
import {
    Search,
    FolderHeart,
    User,
    Heart,
    Droplet,
    AlertTriangle,
    FileText,
    Edit2,
    Plus,
    Save,
    File,
    Download,
    Clock,
    ArrowLeft,
    Trash2
} from 'lucide-react';
import { secretaireDashboardAPI, dossiersAPI, consultationsAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Dossiers.css';

const SecretaireDossiers = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [dossier, setDossier] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDossier, setLoadingDossier] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [consultationSearchQuery, setConsultationSearchQuery] = useState('');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingConsultation, setEditingConsultation] = useState(null);
    const [formData, setFormData] = useState({
        groupe_sanguin: '',
        antecedents_medicaux: '',
        allergies: '',
        traitements: '',
        titre_observation: '',
        observation: ''
    });

    const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await secretaireDashboardAPI.getPatients();
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = async (patient) => {
        setSelectedPatient(patient);
        setLoadingDossier(true);
        setDossier(null);
        setConsultations([]);
        setIsEditing(false);
        setEditingConsultation(null);

        try {
            // Fetch Dossier
            const dossierRes = await secretaireDashboardAPI.getDossierByPatient(patient.id);
            const dossierData = dossierRes.data;
            setDossier(dossierData);

            // Fetch Consultations
            if (dossierData?.id) {
                const consultsResp = await consultationsAPI.getByDossier(dossierData.id);
                setConsultations(consultsResp.data || []);

                // Initialize form with persistent data
                setFormData({
                    groupe_sanguin: dossierData.groupe_sanguin || '',
                    antecedents_medicaux: '',
                    allergies: '',
                    traitements: '',
                    titre_observation: '',
                    observation: ''
                });
            }

        } catch (error) {
            console.error('Error loading patient data:', error);
            alert('Erreur lors du chargement du dossier');
        } finally {
            setLoadingDossier(false);
        }
    };

    const handleEditConsultation = (consult) => {
        setEditingConsultation(consult);
        setFormData({
            groupe_sanguin: dossier.groupe_sanguin || '',
            antecedents_medicaux: consult.antecedents_medicaux || '',
            allergies: consult.allergies || '',
            traitements: consult.traitements || '',
            titre_observation: consult.titre || '',
            observation: consult.observation || ''
        });
        setIsEditing(true);
    };

    const handleSaveConsultation = async () => {
        if (!dossier) return;

        try {
            // 1. Update persistent Info (Groupe Sanguin) on Dossier
            await dossiersAPI.update(dossier.id, {
                groupe_sanguin: formData.groupe_sanguin
            });

            if (editingConsultation) {
                // Update Existing Consultation
                await consultationsAPI.update(editingConsultation.id, {
                    antecedents_medicaux: formData.antecedents_medicaux,
                    allergies: formData.allergies,
                    traitements: formData.traitements,
                    titre: formData.titre_observation,
                    observation: formData.observation
                });
            } else {
                // Create New Consultation
                await consultationsAPI.create(dossier.id, {
                    antecedents_medicaux: formData.antecedents_medicaux,
                    allergies: formData.allergies,
                    traitements: formData.traitements,
                    titre: formData.titre_observation,
                    observation: formData.observation
                });
            }

            // 3. Refresh Data
            const consultsResp = await consultationsAPI.getByDossier(dossier.id);
            setConsultations(consultsResp.data);

            // 4. Reset Form and exit edit mode
            setFormData(prev => ({
                ...prev,
                antecedents_medicaux: '',
                allergies: '',
                traitements: '',
                titre_observation: '',
                observation: ''
            }));

            setIsEditing(false);
            setEditingConsultation(null);
            alert(editingConsultation ? "Consultation modifiée avec succès !" : "Consultation enregistrée avec succès !");

        } catch (error) {
            console.error('Error saving consultation:', error);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDeleteConsultation = async (consultationId, e) => {
        if (e) e.stopPropagation();
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette consultation ?")) {
            try {
                await consultationsAPI.delete(consultationId);
                const consultsResp = await consultationsAPI.getByDossier(dossier.id);
                setConsultations(consultsResp.data);
            } catch (error) {
                console.error('Error deleting consultation:', error);
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const handleDownloadPDF = async (consultationId, e) => {
        if (e) e.stopPropagation();
        try {
            const response = await consultationsAPI.downloadPDF(consultationId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `consultation_${consultationId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            if (error.response && error.response.status === 501) {
                alert("Le module de génération PDF n'est pas installé sur le serveur (reportlab).");
            } else {
                alert("Erreur lors du téléchargement du PDF");
            }
        }
    };

    const handleExportHistory = async () => {
        if (!dossier) return;
        try {
            const response = await consultationsAPI.exportHistory(dossier.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `historique_consultations.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting history:', error);
            alert("Erreur lors de l'exportation de l'historique.");
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.nom} ${p.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="dossiers-page">
            <div className="page-header">
                <h1>Dossiers Médicaux</h1>
            </div>

            <div className="dossiers-layout">
                {/* Patient List */}
                <div className="patients-sidebar card">
                    <div className="sidebar-header">
                        <h3>Patients</h3>
                        <div className="search-bar small">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="patients-list">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className={`patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                                onClick={() => handleSelectPatient(patient)}
                            >
                                <div className="patient-avatar-small">
                                    {patient.prenom?.charAt(0)}{patient.nom?.charAt(0)}
                                </div>
                                <div className="patient-info-small">
                                    <span className="name">{patient.prenom} {patient.nom}</span>
                                    <span className="date">
                                        {patient.date_naissance && new Date(patient.date_naissance).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="dossier-content">
                    {!selectedPatient ? (
                        <div className="card no-selection">
                            <div className="empty-state">
                                <FolderHeart size={64} />
                                <h3>Sélectionnez un patient</h3>
                                <p>Choisissez un patient pour voir ses consultations</p>
                            </div>
                        </div>
                    ) : loadingDossier ? (
                        <Loading text="Chargement du dossier..." />
                    ) : (
                        <>
                            {/* Patient Header */}
                            <div className="card patient-header-card">
                                <div className="patient-header-content">
                                    <div className="patient-avatar-large">
                                        <User size={32} />
                                    </div>
                                    <div className="patient-details">
                                        <h2>{selectedPatient.prenom} {selectedPatient.nom}</h2>
                                        <div className="patient-meta">
                                            <span>{selectedPatient.sexe}</span>
                                            <span>•</span>
                                            <span>Né(e) le {new Date(selectedPatient.date_naissance).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                    <div className="patient-actions">
                                        {isEditing && (
                                            <button className="btn btn-secondary" onClick={() => { setIsEditing(false); setEditingConsultation(null); }}>
                                                <ArrowLeft size={16} />
                                                Retour à l'historique
                                            </button>
                                        )}
                                        {!isEditing && (
                                            <button className="btn btn-primary" onClick={() => {
                                                setEditingConsultation(null);
                                                setFormData(prev => ({ ...prev, antecedents_medicaux: '', allergies: '', traitements: '', titre_observation: '', observation: '' }));
                                                setIsEditing(true);
                                            }}>
                                                <Plus size={16} />
                                                Nouvelle Consultation
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isEditing ? (
                                /* New Consultation Form */
                                <div className="dossier-grid">
                                    <div className="card info-card full-width">
                                        <div className="info-card-header">
                                            <FileText size={20} />
                                            <h4>{editingConsultation ? 'Modifier Consultation' : 'Nouvelle Consultation'}</h4>
                                            <button className="btn btn-primary btn-sm" onClick={handleSaveConsultation}>
                                                <Save size={16} />
                                                {editingConsultation ? 'Mettre à jour' : 'Enregistrer Fichier'}
                                            </button>
                                        </div>
                                        <div className="info-card-content form-grid">
                                            {/* Groupe Sanguin */}
                                            <div className="form-group">
                                                <label className="form-label">Groupe Sanguin</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.groupe_sanguin}
                                                    onChange={(e) => setFormData({ ...formData, groupe_sanguin: e.target.value })}
                                                >
                                                    <option value="">Non renseigné</option>
                                                    {groupesSanguins.map((g) => (
                                                        <option key={g} value={g}>{g}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Allergies */}
                                            <div className="form-group">
                                                <label className="form-label">Allergies</label>
                                                <textarea
                                                    className="form-textarea"
                                                    value={formData.allergies}
                                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                                    placeholder="Allergies constatées..."
                                                    rows={2}
                                                />
                                            </div>

                                            {/* Antécédents */}
                                            <div className="form-group full-width">
                                                <label className="form-label">Antécédents Médicaux</label>
                                                <textarea
                                                    className="form-textarea"
                                                    value={formData.antecedents_medicaux}
                                                    onChange={(e) => setFormData({ ...formData, antecedents_medicaux: e.target.value })}
                                                    placeholder="Antécédents..."
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Traitements */}
                                            <div className="form-group full-width">
                                                <label className="form-label">Traitements</label>
                                                <textarea
                                                    className="form-textarea"
                                                    value={formData.traitements}
                                                    onChange={(e) => setFormData({ ...formData, traitements: e.target.value })}
                                                    placeholder="Traitements prescrits..."
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Observation Title */}
                                            <div className="form-group full-width">
                                                <label className="form-label">Titre Observation</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.titre_observation}
                                                    onChange={(e) => setFormData({ ...formData, titre_observation: e.target.value })}
                                                    placeholder="Ex: Consultation Grippe"
                                                />
                                            </div>

                                            {/* Observation Details */}
                                            <div className="form-group full-width">
                                                <label className="form-label">Détails Observation</label>
                                                <textarea
                                                    className="form-textarea"
                                                    value={formData.observation}
                                                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                                                    placeholder="Détails de la consultation..."
                                                    rows={6}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Consultations History List */
                                <div className="consultations-list">
                                    <div className="list-header">
                                        <h3>Historique des Consultations</h3>
                                        <button className="btn btn-success btn-sm" onClick={handleExportHistory}>
                                            <FileText size={16} />
                                            Exporter Excel
                                        </button>
                                    </div>

                                    <div className="consultation-search">
                                        <Search size={14} className="text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher un titre..."
                                            value={consultationSearchQuery}
                                            onChange={(e) => setConsultationSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {consultations.length === 0 ? (
                                        <div className="empty-history">
                                            <FileText size={48} className="text-gray-300" />
                                            <p>Aucune consultation enregistrée.</p>
                                            <button className="btn btn-link" onClick={() => setIsEditing(true)}>
                                                Commencer une consultation
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="files-grid">
                                            {consultations
                                                .filter(c => (c.titre || '').toLowerCase().includes(consultationSearchQuery.toLowerCase()))
                                                .map((consult) => (
                                                    <div key={consult.id} className="file-card">
                                                        <div className="file-header">
                                                            <FileText size={24} className="text-primary" />
                                                            <div className="file-meta">
                                                                <h4>{consult.titre || 'Consultation'}</h4>
                                                                <span className="file-date">
                                                                    <Clock size={12} />
                                                                    {new Date(consult.date_creation).toLocaleDateString('fr-FR', {
                                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="file-actions">
                                                            <button
                                                                className="btn-icon"
                                                                onClick={() => handleEditConsultation(consult)}
                                                                title="Modifier"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                className="btn-icon"
                                                                onClick={(e) => handleDownloadPDF(consult.id, e)}
                                                                title="Télécharger PDF"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                            <button
                                                                className="btn-icon text-red"
                                                                onClick={(e) => handleDeleteConsultation(consult.id, e)}
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecretaireDossiers;
