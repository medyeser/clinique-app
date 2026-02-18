/**
 * Agent Dashboard Page - Overview for agents d'acceuil
 */
import { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    Clock,
    CheckCircle,
    Activity,
} from 'lucide-react';
import { patientsAPI, rendezVousAPI } from '../services/api';
import Loading from '../components/Loading';
import './Dashboard.css';

const AgentDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalRendezVous: 0,
        thisWeekRdv: 0,
        todayRdv: 0,
    });
    const [thisWeekRdv, setThisWeekRdv] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientsRes, rdvRes] = await Promise.all([
                patientsAPI.getAll(),
                rendezVousAPI.getAll()
            ]);

            // Get this week's dates
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

            // Filter this week's appointments
            const thisWeekRdvFiltered = rdvRes.data.filter(rdv => {
                const rdvDate = new Date(rdv.date_heure);
                return rdvDate >= startOfWeek && rdvDate <= endOfWeek;
            });

            // Filter today's appointments
            const todayRdvFiltered = rdvRes.data.filter(rdv => {
                const rdvDate = new Date(rdv.date_heure).toISOString().split('T')[0];
                return rdvDate === today.toISOString().split('T')[0];
            });

            setStats({
                totalPatients: patientsRes.data?.length || 0,
                totalRendezVous: rdvRes.data?.length || 0,
                thisWeekRdv: thisWeekRdvFiltered.length,
                todayRdv: todayRdvFiltered.length,
            });
            setThisWeekRdv(thisWeekRdvFiltered.slice(0, 10)); // Show first 10
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({
                totalPatients: 0,
                totalRendezVous: 0,
                thisWeekRdv: 0,
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
                    <p className="page-subtitle">Gestion des patients et rendez-vous</p>
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
                        <p>Rendez-vous</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.thisWeekRdv}</h3>
                        <p>Cette semaine</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.todayRdv}</h3>
                        <p>Aujourd'hui</p>
                    </div>
                </div>
            </div>

            {/* This Week Appointments */}
            <div className="dashboard-section">
                <h2>Rendez-vous de cette semaine</h2>
                <div className="appointments-list">
                    {thisWeekRdv.length > 0 ? (
                        thisWeekRdv.map(rdv => (
                            <div key={rdv.id} className="appointment-item">
                                <div className="appointment-info">
                                    <div className="appointment-patient">
                                        {rdv.patient?.prenom} {rdv.patient?.nom}
                                    </div>
                                    <div className="appointment-details">
                                        {new Date(rdv.date_heure).toLocaleString('fr-FR')}
                                        {rdv.medecin && ` - Dr. ${rdv.medecin.prenom} ${rdv.medecin.nom}`}
                                    </div>
                                </div>
                                <div className={`appointment-status ${rdv.statut?.toLowerCase()}`}>
                                    {rdv.statut === 'CONFIRME' ? (
                                        <CheckCircle size={16} />
                                    ) : (
                                        <Clock size={16} />
                                    )}
                                    {rdv.statut || 'En attente'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">Aucun rendez-vous cette semaine</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;