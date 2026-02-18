/**
 * Secretaire Patients Page - Filtered patients view
 */
import { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Calendar as CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { secretaireDashboardAPI, patientsAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Patients.css';

const SecretairePatients = () => {
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [patientFormData, setPatientFormData] = useState({
        nom: '',
        prenom: '',
        date_naissance: '',
        sexe: 'Homme',
        telephone: '',
        email: '',
        adresse: '',
        medecin_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Auto-select first medecin when opening modal
        if (showPatientModal && medecins.length > 0 && !patientFormData.medecin_id) {
            setPatientFormData(prev => ({
                ...prev,
                medecin_id: medecins[0].id.toString()
            }));
        }
    }, [showPatientModal, medecins]);

    const fetchData = async () => {
        try {
            const [patientsRes, medecinsRes] = await Promise.all([
                secretaireDashboardAPI.getPatients(),
                secretaireDashboardAPI.getMedecins()
            ]);
            setPatients(patientsRes.data);
            setMedecins(medecinsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...patientFormData,
                medecin_id: patientFormData.medecin_id ? parseInt(patientFormData.medecin_id) : null
            };
            await patientsAPI.create(data);
            setShowPatientModal(false);
            resetPatientForm();
            fetchData();
            alert('Patient créé avec succès !');
        } catch (error) {
            console.error('Error creating patient:', error);
            alert('Erreur lors de la création du patient');
        }
    };

    const resetPatientForm = () => {
        setPatientFormData({
            nom: '',
            prenom: '',
            date_naissance: '',
            sexe: 'Homme',
            telephone: '',
            email: '',
            adresse: '',
            medecin_id: ''
        });
    };

    const filteredPatients = patients.filter(patient => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            patient.nom?.toLowerCase().includes(query) ||
            patient.prenom?.toLowerCase().includes(query) ||
            patient.telephone?.includes(query) ||
            patient.email?.toLowerCase().includes(query)
        );
    });

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setPatientFormData({
            nom: patient.nom || '',
            prenom: patient.prenom || '',
            date_naissance: patient.date_naissance?.split('T')[0] || '',
            sexe: patient.sexe || 'Homme',
            telephone: patient.telephone || '',
            email: patient.email || '',
            adresse: patient.adresse || '',
            medecin_id: patient.medecin_id?.toString() || ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...patientFormData,
                medecin_id: patientFormData.medecin_id ? parseInt(patientFormData.medecin_id) : null
            };
            await patientsAPI.update(editingPatient.id, data);
            setShowEditModal(false);
            setEditingPatient(null);
            resetPatientForm();
            fetchData();
            alert('Patient modifié avec succès !');
        } catch (error) {
            console.error('Error updating patient:', error);
            alert('Erreur lors de la modification du patient');
        }
    };

    const handleDeleteConfirm = (patient) => {
        setPatientToDelete(patient);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await patientsAPI.delete(patientToDelete.id);
            setShowDeleteModal(false);
            setPatientToDelete(null);
            fetchData();
            alert('Patient supprimé avec succès !');
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Erreur lors de la suppression du patient');
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="patients-page">
            <div className="page-header">
                <h1>Patients</h1>
                <div className="page-header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher (nom, téléphone...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="button" type="button" onClick={() => {
                        resetPatientForm();
                        setShowPatientModal(true);
                    }}>
                        <span className="button__text">Nouveau Patient</span>
                        <span className="button__icon">
                            <Plus className="svg" />
                        </span>
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Contact</th>
                                <th>Date de naissance</th>
                                <th>Sexe</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <User size={48} />
                                            <h3>Aucun patient</h3>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>
                                            <div className="patient-info">
                                                <div className="patient-avatar">
                                                    {patient.prenom?.charAt(0)}{patient.nom?.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="patient-name">
                                                        {patient.prenom} {patient.nom}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                {patient.telephone && (
                                                    <span><Phone size={14} /> {patient.telephone}</span>
                                                )}
                                                {patient.email && (
                                                    <span><Mail size={14} /> {patient.email}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {patient.date_naissance && (
                                                <span className="date-cell">
                                                    <CalendarIcon size={14} />
                                                    {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${patient.sexe === 'Homme' ? 'badge-info' : 'badge-primary'}`}>
                                                {patient.sexe}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-edit"
                                                    onClick={() => handleEdit(patient)}
                                                    title="Modifier"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDeleteConfirm(patient)}
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

            {/* Patient Modal */}
            <Modal
                isOpen={showPatientModal}
                onClose={() => setShowPatientModal(false)}
                title="Nouveau patient"
                size="lg"
            >
                <form onSubmit={handlePatientSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nom *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={patientFormData.nom}
                                onChange={(e) => setPatientFormData({ ...patientFormData, nom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prénom *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={patientFormData.prenom}
                                onChange={(e) => setPatientFormData({ ...patientFormData, prenom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date de naissance *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={patientFormData.date_naissance}
                                onChange={(e) => setPatientFormData({ ...patientFormData, date_naissance: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sexe *</label>
                            <select
                                className="form-select"
                                value={patientFormData.sexe}
                                onChange={(e) => setPatientFormData({ ...patientFormData, sexe: e.target.value })}
                                required
                            >
                                <option value="Homme">Homme</option>
                                <option value="Femme">Femme</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Médecin traitant *</label>
                            <select
                                className="form-select"
                                value={patientFormData.medecin_id}
                                onChange={(e) => setPatientFormData({ ...patientFormData, medecin_id: e.target.value })}
                                required
                            >
                                <option value="">Sélectionner un médecin</option>
                                {medecins.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        Dr. {m.prenom} {m.nom} - {m.specialite}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Téléphone</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={patientFormData.telephone}
                                onChange={(e) => setPatientFormData({ ...patientFormData, telephone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={patientFormData.email}
                                onChange={(e) => setPatientFormData({ ...patientFormData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Adresse</label>
                            <textarea
                                className="form-textarea"
                                value={patientFormData.adresse}
                                onChange={(e) => setPatientFormData({ ...patientFormData, adresse: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowPatientModal(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Créer
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Patient Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingPatient(null);
                    resetPatientForm();
                }}
                title="Modifier patient"
                size="lg"
            >
                <form onSubmit={handleUpdate}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nom *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={patientFormData.nom}
                                onChange={(e) => setPatientFormData({ ...patientFormData, nom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prénom *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={patientFormData.prenom}
                                onChange={(e) => setPatientFormData({ ...patientFormData, prenom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date de naissance *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={patientFormData.date_naissance}
                                onChange={(e) => setPatientFormData({ ...patientFormData, date_naissance: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sexe *</label>
                            <select
                                className="form-select"
                                value={patientFormData.sexe}
                                onChange={(e) => setPatientFormData({ ...patientFormData, sexe: e.target.value })}
                                required
                            >
                                <option value="Homme">Homme</option>
                                <option value="Femme">Femme</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Médecin traitant *</label>
                            <select
                                className="form-select"
                                value={patientFormData.medecin_id}
                                onChange={(e) => setPatientFormData({ ...patientFormData, medecin_id: e.target.value })}
                                required
                            >
                                <option value="">Sélectionner un médecin</option>
                                {medecins.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        Dr. {m.prenom} {m.nom} - {m.specialite}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Téléphone</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={patientFormData.telephone}
                                onChange={(e) => setPatientFormData({ ...patientFormData, telephone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={patientFormData.email}
                                onChange={(e) => setPatientFormData({ ...patientFormData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Adresse</label>
                            <textarea
                                className="form-textarea"
                                value={patientFormData.adresse}
                                onChange={(e) => setPatientFormData({ ...patientFormData, adresse: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => {
                            setShowEditModal(false);
                            setEditingPatient(null);
                            resetPatientForm();
                        }}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Modifier
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setPatientToDelete(null);
                }}
                title="Confirmer la suppression"
                size="sm"
            >
                <div style={{ padding: '1rem 0' }}>
                    <p>Êtes-vous sûr de vouloir supprimer le patient <strong>{patientToDelete?.prenom} {patientToDelete?.nom}</strong> ?</p>
                    <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>Cette action est irréversible.</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => {
                        setShowDeleteModal(false);
                        setPatientToDelete(null);
                    }}>
                        Annuler
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                        Supprimer
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SecretairePatients;
