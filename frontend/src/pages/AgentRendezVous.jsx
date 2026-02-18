/**
 * Agent Rendez-vous Page - Appointment management for agents d'acceuil
 */
import { useState, useEffect } from 'react';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    User,
    Stethoscope,
    Edit2,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Trash2
} from 'lucide-react';
import { rendezVousAPI, patientsAPI, medecinsAPI } from '../services/api';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './RendezVous.css';

const AgentRendezVous = () => {
    const [rendezVous, setRendezVous] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingRdv, setEditingRdv] = useState(null);
    const [rdvToDelete, setRdvToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
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
                rendezVousAPI.getAll(),
                patientsAPI.getAll(),
                medecinsAPI.getAll()
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRdv) {
                await rendezVousAPI.update(editingRdv.id, formData);
            } else {
                await rendezVousAPI.create(formData);
            }
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving appointment:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (rdv) => {
        setEditingRdv(rdv);
        setFormData({
            date_heure: rdv.date_heure ? new Date(rdv.date_heure).toISOString().slice(0, 16) : '',
            patient_id: rdv.patient_id || '',
            medecin_id: rdv.medecin_id || '',
            motif: rdv.motif || '',
            notes: rdv.notes || ''
        });
        setShowModal(true);
    };

    const handleDeleteConfirm = (rdv) => {
        setRdvToDelete(rdv);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await rendezVousAPI.delete(rdvToDelete.id);
            setShowDeleteModal(false);
            setRdvToDelete(null);
            fetchData();
            alert('Rendez-vous supprimé avec succès !');
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Erreur lors de la suppression du rendez-vous');
        }
    };

    const handleStatusChange = async (rdv, newStatus) => {
        try {
            await rendezVousAPI.update(rdv.id, { statut: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            date_heure: '',
            patient_id: '',
            medecin_id: '',
            motif: '',
            notes: ''
        });
        setEditingRdv(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getStatusBadge = (statut) => {
        const statusConfig = {
            'Planifié': 'badge-info',
            'Confirmé': 'badge-success',
            'Annulé': 'badge-danger',
            'Terminé': 'badge-primary'
        };
        return <span className={`badge ${statusConfig[statut] || 'badge-info'}`}>{statut}</span>;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calendar logic
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add empty days for alignment
        for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) {
            days.push(null);
        }

        // Add month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const getRdvForDate = (date) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        return rendezVous.filter(rdv => rdv.date_heure?.startsWith(dateStr));
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedDate(newDate);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="rdv-page">
            <div className="page-header">
                <h1>Gestion des Rendez-vous</h1>
                <div className="page-header-actions">
                    <div className="view-toggle">
                        <button
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('list')}
                        >
                            Liste
                        </button>
                        <button
                            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('calendar')}
                        >
                            Calendrier
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Nouveau RDV
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                /* List View */
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
                                                <div className="datetime-cell">
                                                    <span className="date">
                                                        <CalendarIcon size={14} />
                                                        {formatDate(rdv.date_heure)}
                                                    </span>
                                                    <span className="time">
                                                        <Clock size={14} />
                                                        {formatTime(rdv.date_heure)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="person-cell">
                                                    <User size={14} />
                                                    {rdv.patient?.prenom} {rdv.patient?.nom}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="person-cell">
                                                    <Stethoscope size={14} />
                                                    Dr. {rdv.medecin?.nom}
                                                </div>
                                            </td>
                                            <td>{rdv.motif || '-'}</td>
                                            <td>{getStatusBadge(rdv.statut)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {rdv.statut === 'Planifié' && (
                                                        <button
                                                            className="btn btn-icon btn-success"
                                                            onClick={() => handleStatusChange(rdv, 'Confirmé')}
                                                            title="Confirmer"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    {rdv.statut !== 'Annulé' && rdv.statut !== 'Terminé' && (
                                                        <button
                                                            className="btn btn-icon"
                                                            style={{ background: 'var(--warning)', color: 'white' }}
                                                            onClick={() => handleStatusChange(rdv, 'Annulé')}
                                                            title="Annuler"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-icon btn-secondary"
                                                        onClick={() => handleEdit(rdv)}
                                                        title="Modifier"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-danger"
                                                        onClick={() => handleDeleteConfirm(rdv)}
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
            ) : (
                /* Calendar View */
                <div className="card calendar-card">
                    <div className="calendar-header">
                        <button className="btn btn-icon btn-secondary" onClick={() => navigateMonth(-1)}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2>
                            {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button className="btn btn-icon btn-secondary" onClick={() => navigateMonth(1)}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="calendar-grid">
                        <div className="calendar-weekdays">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        <div className="calendar-days">
                            {getDaysInMonth(selectedDate).map((day, index) => {
                                const dayRdv = getRdvForDate(day);
                                const isToday = day && day.toDateString() === new Date().toDateString();
                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${dayRdv.length > 0 ? 'has-rdv' : ''}`}
                                    >
                                        {day && (
                                            <>
                                                <span className="day-number">{day.getDate()}</span>
                                                {dayRdv.length > 0 && (
                                                    <div className="day-rdv-count">
                                                        {dayRdv.length} RDV
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingRdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
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
                                        Dr. {m.prenom} {m.nom}
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
                                placeholder="Motif de la consultation"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notes supplémentaires"
                                rows="3"
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingRdv ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmer la suppression"
            >
                <div className="delete-confirmation">
                    <p>Êtes-vous sûr de vouloir supprimer ce rendez-vous ?</p>
                    <p className="delete-warning">Cette action est irréversible.</p>
                </div>
                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDelete}
                    >
                        Supprimer
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default AgentRendezVous;