/**
 * Secretaire Rendez-vous Page - Full appointment management
 */
import { useState, useEffect } from 'react';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    User,
    Stethoscope,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { secretaireDashboardAPI, rendezVousAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './RendezVous.css';

const SecretaireRendezVous = () => {
    const [rendezVous, setRendezVous] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRdvModal, setShowRdvModal] = useState(false);
    const [formData, setFormData] = useState({
        date_heure: '',
        patient_id: '',
        medecin_id: '',
        motif: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rdvRes, patientsRes, medecinsRes] = await Promise.all([
                secretaireDashboardAPI.getRendezVous(),
                secretaireDashboardAPI.getPatients(),
                secretaireDashboardAPI.getMedecins()
            ]);
            setRendezVous(rdvRes.data);
            setPatients(patientsRes.data);
            setMedecins(medecinsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (rdv, newStatus) => {
        try {
            await rendezVousAPI.update(rdv.id, { statut: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleRdvSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                patient_id: parseInt(formData.patient_id),
                medecin_id: parseInt(formData.medecin_id)
            };
            await rendezVousAPI.create(data);
            setShowRdvModal(false);
            resetRdvForm();
            fetchData();
            alert('Rendez-vous créé avec succès !');
        } catch (error) {
            console.error('Error creating rdv:', error);
            alert('Erreur lors de la création du rendez-vous');
        }
    };

    const resetRdvForm = () => {
        setFormData({
            date_heure: '',
            patient_id: '',
            medecin_id: '',
            motif: '',
            notes: ''
        });
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="rendez-vous-page">
            <div className="page-header">
                <div>
                    <h1>Rendez-vous</h1>
                    <p className="page-subtitle">Rendez-vous des médecins assignés</p>
                </div>
                <div className="page-header-actions">
                    <button className="button" type="button" onClick={() => {
                        resetRdvForm();
                        setShowRdvModal(true);
                    }}>
                        <span className="button__text">Nouveau RDV</span>
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
                                <th>Date & Heure</th>
                                <th>Patient</th>
                                <th>Médecin</th>
                                <th>Motif</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rendezVous.length === 0 ? (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <CalendarIcon size={48} />
                                            <h3>Aucun rendez-vous</h3>
                                            <p>Planifiez votre premier rendez-vous</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rendezVous.map((rdv) => (
                                    <tr key={rdv.id}>
                                        <td>
                                            <div className="date-time-cell">
                                                <CalendarIcon size={14} />
                                                <span>{new Date(rdv.date_heure).toLocaleDateString('fr-FR')}</span>
                                                <Clock size={14} />
                                                <span>{new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="patient-cell">
                                                <User size={14} />
                                                <span>{rdv.patient?.prenom} {rdv.patient?.nom}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="medecin-cell">
                                                <Stethoscope size={14} />
                                                <span>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</span>
                                            </div>
                                        </td>
                                        <td>{rdv.motif || '-'}</td>
                                        <td>
                                            <span className={`badge ${rdv.statut === 'Confirmé' || rdv.statut === 'CONFIRME' ? 'badge-success' :
                                                rdv.statut === 'Annulé' || rdv.statut === 'ANNULE' ? 'badge-danger' :
                                                    'badge-warning'
                                                }`}>
                                                {rdv.statut}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {(rdv.statut === 'Planifié' || rdv.statut === 'PLANIFIE') && (
                                                    <button
                                                        className="btn btn-icon btn-success"
                                                        onClick={() => handleStatusChange(rdv, 'Confirmé')}
                                                        title="Confirmer"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {rdv.statut !== 'Annulé' && rdv.statut !== 'ANNULE' && rdv.statut !== 'Terminé' && rdv.statut !== 'TERMINE' && (
                                                    <button
                                                        className="btn btn-icon"
                                                        style={{ background: 'var(--warning)', color: 'white' }}
                                                        onClick={() => handleStatusChange(rdv, 'Annulé')}
                                                        title="Annuler"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rendez-vous Modal */}
            <Modal
                isOpen={showRdvModal}
                onClose={() => setShowRdvModal(false)}
                title="Nouveau rendez-vous"
                size="lg"
            >
                <form onSubmit={handleRdvSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Date et heure *</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={formData.date_heure}
                                onChange={(e) => setFormData({ ...formData, date_heure: e.target.value })}
                                required
                                step="60"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Patient *</label>
                            <select
                                className="form-select"
                                value={formData.patient_id}
                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                required
                            >
                                <option value="">Sélectionner un patient</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.prenom} {p.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Médecin *</label>
                            <select
                                className="form-select"
                                value={formData.medecin_id}
                                onChange={(e) => setFormData({ ...formData, medecin_id: e.target.value })}
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
                            <label className="form-label">Motif</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.motif}
                                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                                placeholder="Consultation, suivi, etc."
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notes supplémentaires..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowRdvModal(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Planifier
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SecretaireRendezVous;
