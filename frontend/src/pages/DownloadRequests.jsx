/**
 * Download Requests Management Page (Admin Only)
 * Allows admins to view, approve, reject, and delete download requests
 */
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './DownloadRequests.css';

const DownloadRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [searchTerm, setSearchTerm] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    const API_URL = 'http://localhost:8000/api/download-requests';

    // Fetch all download requests
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des demandes');

            const data = await response.json();
            setRequests(data);
            setFilteredRequests(data);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Filter requests based on status and search term
    useEffect(() => {
        let filtered = requests;

        // Filter by status
        if (filter !== 'all') {
            filtered = filtered.filter(req => req.status === filter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(req =>
                req.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRequests(filtered);
    }, [filter, searchTerm, requests]);

    // Approve request and generate code
    const handleApprove = async (request) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/${request.id}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expiration_hours: 24 })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'approbation');

            const data = await response.json();
            setSelectedRequest(data);
            setGeneratedCode(data.access_code);
            setShowApproveModal(true);

            // Refresh list
            fetchRequests();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'approbation de la demande');
        }
    };

    // Send email via EmailJS
    const sendEmailWithCode = async () => {
        if (!selectedRequest || !generatedCode) return;

        setSendingEmail(true);

        try {
            // EmailJS configuration
            const serviceId = 'service_jcmi2wp';
            const templateId = 'template_c0nat3i';
            const publicKey = 'EdpXaYepHxQ9642-B';

            const clinicNames = {
                'monji-slim': 'Clinique Monji Slim',
                'tawfik': 'Clinique Tawfik'
            };

            const templateParams = {
                to_email: selectedRequest.email,
                to_name: `${selectedRequest.prenom} ${selectedRequest.nom}`,
                prenom: selectedRequest.prenom,
                access_code: generatedCode,
                clinique_name: clinicNames[selectedRequest.clinique_id] || selectedRequest.clinique_id,
                subject: 'Votre code d\'accès pour télécharger le logiciel'
            };

            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            alert('✅ Email envoyé avec succès!');
            setShowApproveModal(false);
            setSelectedRequest(null);
            setGeneratedCode('');
        } catch (error) {
            console.error('Erreur EmailJS:', error);
            alert('❌ Erreur lors de l\'envoi de l\'email. Le code a été généré mais l\'email n\'a pas été envoyé.');
        } finally {
            setSendingEmail(false);
        }
    };

    // Reject request
    const handleReject = async (requestId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette demande?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/${requestId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Erreur lors du rejet');

            alert('✅ Demande rejetée');
            fetchRequests();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du rejet de la demande');
        }
    };

    // Delete request
    const handleDelete = async (requestId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression');

            alert('✅ Demande supprimée');
            fetchRequests();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression de la demande');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('fr-FR');
    };

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            default: return '';
        }
    };

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'approved': return 'Approuvé';
            case 'rejected': return 'Rejeté';
            default: return status;
        }
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="download-requests-container">
            <div className="page-header">
                <h1>Demandes de Téléchargement</h1>
                <p>Gérez les demandes de téléchargement du logiciel</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-tabs">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        Toutes ({requests.length})
                    </button>
                    <button
                        className={filter === 'pending' ? 'active' : ''}
                        onClick={() => setFilter('pending')}
                    >
                        En attente ({requests.filter(r => r.status === 'pending').length})
                    </button>
                    <button
                        className={filter === 'approved' ? 'active' : ''}
                        onClick={() => setFilter('approved')}
                    >
                        Approuvées ({requests.filter(r => r.status === 'approved').length})
                    </button>
                    <button
                        className={filter === 'rejected' ? 'active' : ''}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejetées ({requests.filter(r => r.status === 'rejected').length})
                    </button>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Requests Table */}
            <div className="table-container">
                {filteredRequests.length === 0 ? (
                    <div className="no-data">Aucune demande trouvée</div>
                ) : (
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Email</th>
                                <th>Clinique</th>
                                <th>Base de données</th>
                                <th>Statut</th>
                                <th>Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((request) => (
                                <tr key={request.id}>
                                    <td>{formatDate(request.created_at)}</td>
                                    <td>{request.nom}</td>
                                    <td>{request.prenom}</td>
                                    <td>{request.email}</td>
                                    <td>{request.clinique_id === 'monji-slim' ? 'Monji Slim' : 'Tawfik'}</td>
                                    <td><code>{request.database_name}</code></td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(request.status)}`}>
                                            {getStatusLabel(request.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {request.access_code ? (
                                            <code className="access-code">{request.access_code}</code>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {request.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => handleApprove(request)}
                                                        title="Approuver"
                                                    >
                                                        ✓ Approuver
                                                    </button>
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => handleReject(request.id)}
                                                        title="Rejeter"
                                                    >
                                                        ✗ Rejeter
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(request.id)}
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Approve Modal */}
            {showApproveModal && selectedRequest && (
                <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Demande Approuvée ✅</h2>
                        <div className="modal-body">
                            <p>Code d'accès généré pour <strong>{selectedRequest.prenom} {selectedRequest.nom}</strong></p>
                            <div className="code-display">
                                <h3>Code d'accès:</h3>
                                <div className="code-box">{generatedCode}</div>
                            </div>
                            <p className="email-info">
                                📧 Email: <strong>{selectedRequest.email}</strong>
                            </p>
                            <p className="note">
                                ⚠️ Ce code est valide pendant 24 heures.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-send-email"
                                onClick={sendEmailWithCode}
                                disabled={sendingEmail}
                            >
                                {sendingEmail ? 'Envoi en cours...' : '📧 Envoyer par Email (EmailJS)'}
                            </button>
                            <button
                                className="btn-close"
                                onClick={() => setShowApproveModal(false)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DownloadRequests;
