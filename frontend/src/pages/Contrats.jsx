/**
 * Contrats Page
 * Manage employment contracts and generate PDFs
 */
import { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Download,
    Search,
    X,
    CheckCircle,
    User,
    Calendar,
    Briefcase
} from 'lucide-react';
import { contratsAPI } from '../services/api';
import Loading from '../components/Loading';
import './Contrats.css';

const Contrats = () => {
    const [contrats, setContrats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nom_employe: '',
        poste: '',
        type_contrat: 'CDI',
        date_debut: '',
        date_fin: '',
        salaire: '',
        missions: '',
        horaires: '',
        statut_contrat: 'Brouillon',
        signature_employeur: '',
        signature_employe: ''
    });

    useEffect(() => {
        fetchContrats();
    }, []);

    const fetchContrats = async () => {
        try {
            const response = await contratsAPI.getAll();
            setContrats(response.data);
        } catch (error) {
            console.error('Error fetching contrats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter contrats based on search term
    const filteredContrats = contrats.filter(contrat =>
        contrat.nom_employe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contrat.date_debut.includes(searchTerm) ||
        contrat.date_fin.includes(searchTerm)
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Convert empty date strings to null for optional fields if needed, 
            // but here date_debut/fin are required strings. 
            // Signatures are optional datetime strings, API expects null if empty?
            // Simple replacement for empty strings to null for signatures
            const payload = {
                ...formData,
                signature_employeur: formData.signature_employeur || null,
                signature_employe: formData.signature_employe || null
            };

            await contratsAPI.create(payload);
            await fetchContrats();
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error('Error creating contrat:', error);
            alert('Erreur lors de la création du contrat');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nom_employe: '',
            poste: '',
            type_contrat: 'CDI',
            date_debut: '',
            date_fin: '',
            salaire: '',
            missions: '',
            horaires: '',
            statut_contrat: 'Brouillon',
            signature_employeur: '',
            signature_employe: ''
        });
    };

    const handleDownload = async (contrat) => {
        try {
            const response = await contratsAPI.downloadPDF(contrat.id);
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contrat_${contrat.nom_employe.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Erreur lors du téléchargement du PDF');
        }
    };

    if (loading && !showForm && contrats.length === 0) return <Loading />;

    return (
        <div className="contrats-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Gestion des Contrats</h1>
                    <p>Générez et gérez les contrats de travail du personnel</p>
                </div>
                {!showForm && (
                    <div className="header-actions">
                        <div className="search-bar">
                            <Search size={18} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Rechercher un contrat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="add-btn" onClick={() => setShowForm(true)}>
                            <Plus size={20} />
                            Nouveau Contrat
                        </button>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="form-card">
                    <div className="form-header">
                        <h2>Nouveau Contrat de Travail</h2>
                        <button className="close-btn" onClick={() => setShowForm(false)}>
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <div className="form-group">
                            <label>Nom de l'Employé</label>
                            <input
                                type="text"
                                name="nom_employe"
                                value={formData.nom_employe}
                                onChange={handleInputChange}
                                required
                                placeholder="ex: Jean Dupont"
                            />
                        </div>

                        <div className="form-group">
                            <label>Poste</label>
                            <input
                                type="text"
                                name="poste"
                                value={formData.poste}
                                onChange={handleInputChange}
                                required
                                placeholder="ex: Infirmier"
                            />
                        </div>

                        <div className="form-group">
                            <label>Type de Contrat</label>
                            <select
                                name="type_contrat"
                                value={formData.type_contrat}
                                onChange={handleInputChange}
                            >
                                <option value="CDI">CDI</option>
                                <option value="CDD">CDD</option>
                                <option value="Stage">Stage</option>
                                <option value="Vacataire">Vacataire</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Statut du Contrat</label>
                            <select
                                name="statut_contrat"
                                value={formData.statut_contrat}
                                onChange={handleInputChange}
                            >
                                <option value="Brouillon">Brouillon</option>
                                <option value="Validé">Validé</option>
                                <option value="Signé">Signé</option>
                                <option value="Archivé">Archivé</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date de Début</label>
                            <input
                                type="date"
                                name="date_debut"
                                value={formData.date_debut}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Date de Fin (Obligatoire)</label>
                            <input
                                type="date"
                                name="date_fin"
                                value={formData.date_fin}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Salaire Brut Mensuel (€)</label>
                            <input
                                type="number"
                                name="salaire"
                                value={formData.salaire}
                                onChange={handleInputChange}
                                required
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label>Horaires</label>
                            <input
                                type="text"
                                name="horaires"
                                value={formData.horaires}
                                onChange={handleInputChange}
                                required
                                placeholder="ex: 35h/semaine, 9h-17h"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Missions</label>
                            <textarea
                                name="missions"
                                value={formData.missions}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                placeholder="Détail des missions confiées..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Date Signature Employeur (Validation)</label>
                            <input
                                type="datetime-local"
                                name="signature_employeur"
                                value={formData.signature_employeur}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Date Signature Employé (Acceptation)</label>
                            <input
                                type="datetime-local"
                                name="signature_employe"
                                value={formData.signature_employe}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                                Annuler
                            </button>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Création...' : <><CheckCircle size={18} /> Valider et Créer</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-card">
                <div className="table-responsive">
                    <table className="contracts-table">
                        <thead>
                            <tr>
                                <th>Employé</th>
                                <th>Poste</th>
                                <th>Type</th>
                                <th>Dates</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContrats.map((contrat) => (
                                <tr key={contrat.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={16} className="text-muted" />
                                            <span className="font-medium">{contrat.nom_employe}</span>
                                        </div>
                                    </td>
                                    <td>{contrat.poste}</td>
                                    <td>
                                        <span className="badge badge-blue">{contrat.type_contrat}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                                            <span>Du: {new Date(contrat.date_debut).toLocaleDateString()}</span>
                                            <span>Au: {new Date(contrat.date_fin).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${contrat.statut_contrat.toLowerCase()}`}>
                                            {contrat.statut_contrat}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="action-btn download"
                                            title="Télécharger PDF"
                                            onClick={() => handleDownload(contrat)}
                                        >
                                            <Download size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredContrats.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        {searchTerm ? 'Aucun contrat ne correspond à votre recherche.' : 'Aucun contrat trouvé. Créez-en un nouveau !'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Contrats;
