/**
 * Agent Patients Page - View and add patients for agents d'acceuil
 */
import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    User,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    Stethoscope,
    Download
} from 'lucide-react';
import { patientsAPI, rapportsAPI, medecinsAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Patients.css';

const AgentPatients = () => {
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [currentAgentId, setCurrentAgentId] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        date_naissance: '',
        sexe: 'Homme',
        adresse: '',
        telephone: '',
        email: '',
        numero_securite_sociale: '',
        medecin_id: ''
    });

    useEffect(() => {
        // Get current agent ID from localStorage
        const agentData = localStorage.getItem('agentAcceuil');
        if (agentData) {
            try {
                const agent = JSON.parse(agentData);
                setCurrentAgentId(agent.id);
                console.log('Current agent ID:', agent.id);
            } catch (e) {
                console.error('Error parsing agent data:', e);
            }
        }
        fetchPatients();
        fetchMedecins();
    }, []);

    // Live search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchPatients = async () => {
        try {
            const response = await patientsAPI.getAll();
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
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
            fetchPatients();
            return;
        }
        try {
            const response = await patientsAPI.search(searchQuery);
            setPatients(response.data);
        } catch (error) {
            console.error('Error searching patients:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare data - convert empty strings to null and medecin_id to integer
            const data = {
                ...formData,
                medecin_id: formData.medecin_id ? parseInt(formData.medecin_id) : null,
                email: formData.email || null,
                telephone: formData.telephone || null,
                numero_securite_sociale: formData.numero_securite_sociale || null,
                adresse: formData.adresse || null
            };

            if (editingPatient) {
                await patientsAPI.update(editingPatient.id, data);
            } else {
                await patientsAPI.create(data);
            }
            fetchPatients();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setFormData({
            nom: patient.nom || '',
            prenom: patient.prenom || '',
            date_naissance: patient.date_naissance || '',
            sexe: patient.sexe || 'Homme',
            adresse: patient.adresse || '',
            telephone: patient.telephone || '',
            email: patient.email || '',
            numero_securite_sociale: patient.numero_securite_sociale || '',
            medecin_id: patient.medecin_id || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            prenom: '',
            date_naissance: '',
            sexe: 'Homme',
            adresse: '',
            telephone: '',
            email: '',
            numero_securite_sociale: '',
            medecin_id: ''
        });
        setEditingPatient(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleExportExcel = async () => {
        try {
            const response = await patientsAPI.exportPatientsExcel();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `patients_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Erreur lors de l\'export Excel');
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="patients-page">
            <div className="page-header">
                <h1>Gestion des Patients</h1>
                <div className="page-header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un patient..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={handleExportExcel} title="Exporter Excel">
                        <Download size={18} />
                        Excel
                    </button>
                    <button className="button" type="button" onClick={openAddModal}>
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
                                <th>Médecin</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <User size={48} />
                                            <h3>Aucun patient trouvé</h3>
                                            <p>Il n'y a encore aucun patient enregistré dans le système.</p>
                                            <button className="btn btn-primary" onClick={openAddModal}>
                                                <Plus size={18} />
                                                Ajouter le premier patient
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
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
                                                    <span className="patient-id">ID: {patient.id}</span>
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
                                                {patient.sexe || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            {patient.medecin && (
                                                <span className="medecin-cell">
                                                    <Stethoscope size={14} />
                                                    Dr. {patient.medecin.prenom} {patient.medecin.nom}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {currentAgentId && patient.created_by_agent_id && patient.created_by_agent_id === currentAgentId && (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleEdit(patient)}
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={editingPatient ? "Modifier Patient" : "Nouveau Patient"}
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
                            <label className="form-label">Sexe *</label>
                            <select
                                className="form-select"
                                value={formData.sexe}
                                onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
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
                                value={formData.medecin_id}
                                onChange={(e) => setFormData({ ...formData, medecin_id: e.target.value })}
                                required
                            >
                                <option value="">Sélectionner un médecin</option>
                                {medecins.map(medecin => (
                                    <option key={medecin.id} value={medecin.id}>
                                        Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Numéro Sécurité Sociale</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.numero_securite_sociale}
                                onChange={(e) => setFormData({ ...formData, numero_securite_sociale: e.target.value })}
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
                            <label className="form-label">Adresse</label>
                            <textarea
                                className="form-textarea"
                                value={formData.adresse}
                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => {
                            setShowModal(false);
                            resetForm();
                        }}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingPatient ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AgentPatients;