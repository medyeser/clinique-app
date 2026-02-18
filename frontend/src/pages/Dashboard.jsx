/**
 * Dashboard Page - Main overview with statistics
 */
import { useState, useEffect } from 'react';
import {
    Users,
    Stethoscope,
    Calendar,
    FolderHeart,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Activity,
    AlertCircle,
    Pill,
    DollarSign
} from 'lucide-react';
import { rapportsAPI, rendezVousAPI } from '../services/api';
import Loading from '../components/Loading';
import './Dashboard.css';

const Dashboard = () => {
    const [globalStats, setGlobalStats] = useState(null);
    const [medecinStats, setMedecinStats] = useState([]);
    const [rdvStats, setRdvStats] = useState(null);
    const [medicalStats, setMedicalStats] = useState(null);
    const [todayRdv, setTodayRdv] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [globalRes, medRes, rdvStatsRes, medStatsRes, rdvDataRes] = await Promise.all([
                rapportsAPI.getGlobal(),
                rapportsAPI.getMedecinsStats(),
                rapportsAPI.getRdvStats(),
                rapportsAPI.getMedicalStats(),
                rendezVousAPI.getByDay(new Date().toISOString().split('T')[0])
            ]);

            setGlobalStats(globalRes.data);
            setMedecinStats(medRes.data);
            setRdvStats(rdvStatsRes.data);
            setMedicalStats(medStatsRes.data);
            setTodayRdv(rdvDataRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
                    <p className="page-subtitle">Vue d'ensemble et statistiques de la clinique</p>
                </div>
                <div className="header-actions">
                    <p className="last-updated">Mis à jour: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* 1. Global Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{globalStats?.total_patients || 0}</h3>
                        <p>Total Patients</p>
                        <span className="stat-trend positive">
                            +{globalStats?.nouveaux_patients_mois || 0} ce mois
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <Stethoscope size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{globalStats?.total_medecins || 0}</h3>
                        <p>Médecins</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{globalStats?.total_rendez_vous || 0}</h3>
                        <p>Total Rendez-vous</p>
                        <span className="stat-trend negative">
                            {rdvStats?.taux_annulation || 0}% annulation
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{todayRdv.length}</h3>
                        <p>RDV Aujourd'hui</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>
                            {medecinStats.reduce((sum, med) => sum + (med.revenus_total || 0), 0)} DT
                        </h3>
                        <p>Revenus Totaux</p>
                        <span className="stat-trend positive">
                            +{medecinStats.reduce((sum, med) => sum + (med.revenus_mois || 0), 0)} DT ce mois
                        </span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">

                {/* 2. Doctor Performance */}
                <div className="card dashboard-card">
                    <div className="card-header">
                        <h3><Stethoscope size={20} /> Performance Médecins</h3>
                    </div>
                    <div className="card-body">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Médecin</th>
                                        <th>Spécialité</th>
                                        <th className="text-center">Patients</th>
                                        <th className="text-center">Total Cons.</th>
                                        <th className="text-center">Cons. Mois</th>
                                        <th className="text-center">Revenus Total</th>
                                        <th className="text-center">Revenus Mois</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medecinStats.slice(0, 5).map(med => (
                                        <tr key={med.id}>
                                            <td className="font-medium">Dr. {med.nom}</td>
                                            <td className="text-muted text-sm">{med.specialite}</td>
                                            <td className="text-center">{med.nb_patients}</td>
                                            <td className="text-center font-bold">{med.nb_consultations}</td>
                                            <td className="text-center text-success font-medium">
                                                {med.nb_consultations_mois}
                                            </td>
                                            <td className="text-center font-bold text-success">
                                                {med.revenus_total || 0} DT
                                            </td>
                                            <td className="text-center font-medium text-success">
                                                {med.revenus_mois || 0} DT
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 3. Appointment Analytics */}
                <div className="card dashboard-card">
                    <div className="card-header">
                        <h3><TrendingUp size={20} /> Analyse Rendez-vous</h3>
                    </div>
                    <div className="card-body">
                        <div className="analytics-section">
                            <div className="analytics-block">
                                <h4>Jours les plus chargés</h4>
                                <div className="tags-list">
                                    {rdvStats?.jours_charges?.slice(0, 3).map((jour, i) => (
                                        <span key={i} className="tag tag-blue">
                                            {jour.jour} ({jour.count})
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="analytics-block mt-4">
                                <h4>Heures de pointe</h4>
                                <div className="tags-list">
                                    {rdvStats?.heures_pointe?.slice(0, 3).map((h, i) => (
                                        <span key={i} className="tag tag-orange">
                                            {h.heure} ({h.count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Medical Insights */}
                <div className="card dashboard-card full-width">
                    <div className="card-header">
                        <h3><Activity size={20} /> Statistiques Médicales</h3>
                    </div>
                    <div className="card-body medical-stats-grid">

                        {/* Pathologies */}
                        <div className="medical-column">
                            <h4><AlertCircle size={16} /> Pathologies Fréquentes</h4>
                            <ul className="medical-list">
                                {medicalStats?.pathologies_frequentes?.map((path, i) => (
                                    <li key={i}>
                                        <span className="name">{path.nom}</span>
                                        <span className="count badge badge-primary">{path.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Traitements */}
                        <div className="medical-column">
                            <h4><Pill size={16} /> Traitements Top 10</h4>
                            <div className="tags-cloud">
                                {medicalStats?.traitements_populaires?.map((t, i) => (
                                    <span key={i} className="tag tag-green">
                                        {t.nom} <small>x{t.count}</small>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className="medical-column">
                            <h4><AlertCircle size={16} /> Allergies Communes</h4>
                            <div className="tags-cloud">
                                {medicalStats?.allergies_frequentes?.map((t, i) => (
                                    <span key={i} className="tag tag-red">
                                        {t.nom} <small>x{t.count}</small>
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
