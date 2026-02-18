/**
 * Secretaire Dashboard Page - Filtered overview for secretaires
 */
import { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    FolderHeart,
    Clock,
    CheckCircle,
    XCircle,
    Activity,
} from 'lucide-react';
import { secretaireDashboardAPI } from '../services/api';
import Loading from '../components/Loading';
import './Dashboard.css';

const SecretaireDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalRendezVous: 0,
        totalDossiers: 0,
        todayRdv: 0,
    });
    const [todayRdv, setTodayRdv] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [patientsRes, rdvRes, dossiersRes] = await Promise.all([
                secretaireDashboardAPI.getPatients(0, 500),
                secretaireDashboardAPI.getRendezVous(0, 500),
                secretaireDashboardAPI.getDossiers(0, 500)
            ]);

            // Filter today's appointments for assigned medecins
            const todayRdvFiltered = rdvRes.data.filter(rdv => {
                const rdvDate = new Date(rdv.date_heure).toISOString().split('T')[0];
                return rdvDate === today;
            });

            setStats({
                totalPatients: patientsRes.data?.length || 0,
                totalRendezVous: rdvRes.data?.length || 0,
                totalDossiers: dossiersRes.data?.length || 0,
                todayRdv: todayRdvFiltered.length,
            });
            setTodayRdv(todayRdvFiltered);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error details:', error.response?.data);
            // Set empty stats on error
            setStats({
                totalPatients: 0,
                totalRendezVous: 0,
                totalDossiers: 0,
                todayRdv: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1>Tableau de bord</h1>
                    <p className="page-subtitle">Vue d'ensemble de vos médecins assignés</p>
                </div>
                <div className="header-actions">
                    <p className="last-updated">Mis à jour: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalPatients}</h3>
                        <p>Patients</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalRendezVous}</h3>
                        <p>Total Rendez-vous</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.todayRdv}</h3>
                        <p>RDV Aujourd'hui</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <FolderHeart size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalDossiers}</h3>
                        <p>Dossiers Médicaux</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Today's Appointments */}
                <div className="card dashboard-card">
                    <div className="card-header">
                        <h3><Calendar size={20} /> Rendez-vous d'aujourd'hui</h3>
                    </div>
                    <div className="card-body">
                        {todayRdv.length === 0 ? (
                            <div className="empty-state">
                                <p>Aucun rendez-vous aujourd'hui</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Heure</th>
                                            <th>Patient</th>
                                            <th>Médecin</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayRdv.slice(0, 10).map((rdv) => (
                                            <tr key={rdv.id}>
                                                <td>
                                                    <Clock size={14} />
                                                    {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td>{rdv.patient?.prenom} {rdv.patient?.nom}</td>
                                                <td>Dr. {rdv.medecin?.prenom} {rdv.medecin?.nom}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        rdv.statut === 'CONFIRME' ? 'badge-success' :
                                                        rdv.statut === 'ANNULE' ? 'badge-danger' :
                                                        'badge-warning'
                                                    }`}>
                                                        {rdv.statut}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecretaireDashboard;

