/**
 * Medecin Dashboard Page
 */
import { useState, useEffect } from 'react';
import {
    Activity,
    Calendar,
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { medecinDashboardAPI } from '../services/api';
import Loading from '../components/Loading';
import './Dashboard.css'; // Reuse existing styles

const MedecinDashboard = () => {
    const [stats, setStats] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [appointments, setAppointments] = useState({ today: [], week: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, graphRes, aptRes] = await Promise.all([
                medecinDashboardAPI.getStats(),
                medecinDashboardAPI.getGraph(),
                medecinDashboardAPI.getAppointments()
            ]);

            setStats(statsRes.data);
            setGraphData(graphRes.data);
            setAppointments(aptRes.data);
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
                    <h1>Tableau de bord Docteur</h1>
                    <p className="page-subtitle">Aperçu de votre activité et revenus</p>
                </div>
                <div className="header-actions">
                    <p className="last-updated">Mis à jour: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* 1. Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.consultations?.total || 0}</h3>
                        <p>Total Consultations</p>
                        <span className="stat-trend positive">
                            +{stats?.consultations?.month || 0} ce mois
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.earnings?.today || 0} DT</h3>
                        <p>Revenus Aujourd'hui</p>
                        <span className="stat-trend">
                            {stats?.consultations?.today || 0} consultations
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.earnings?.week || 0} DT</h3>
                        <p>Revenus Semaine</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.earnings?.month || 0} DT</h3>
                        <p>Revenus Mois</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* 2. Earnings Graph */}
                <div className="card dashboard-card">
                    <div className="card-header">
                        <h3><Activity size={20} /> Revenus Hebdomadaires</h3>
                    </div>
                    <div style={{ width: '100%', height: 300, padding: '1rem' }}>
                        <ResponsiveContainer>
                            <BarChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value} DT`} />
                                <Legend />
                                <Bar dataKey="amount" name="Revenus (DT)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Today's Appointments */}
                <div className="card dashboard-card">
                    <div className="card-header">
                        <h3><Calendar size={20} /> Rendez-vous Aujourd'hui</h3>
                    </div>
                    <div className="card-body">
                        {appointments.today.length === 0 ? (
                            <div className="empty-state">
                                <p>Aucun rendez-vous prévu aujourd'hui.</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Heure</th>
                                            <th>Patient</th>
                                            <th>Motif</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.today.map((apt) => (
                                            <tr key={apt.id}>
                                                <td className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-muted" />
                                                        {apt.time}
                                                    </div>
                                                </td>
                                                <td>{apt.patient_name}</td>
                                                <td>{apt.motif || "-"}</td>
                                                <td>
                                                    <span className={`badge badge-${getStatusColor(apt.status)}`}>
                                                        {apt.status}
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

            {/* 4. Week's Appointments (History/Upcoming) */}
            <div className="card dashboard-card full-width">
                <div className="card-header">
                    <h3><Calendar size={20} /> Aperçu de la semaine</h3>
                </div>
                <div className="card-body">
                    {appointments.week.length === 0 ? (
                        <div className="empty-state">
                            <p>Aucun rendez-vous cette semaine.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Heure</th>
                                        <th>Patient</th>
                                        <th>Motif</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.week.map((apt) => (
                                        <tr key={apt.id}>
                                            <td>{apt.date}</td>
                                            <td>{apt.time}</td>
                                            <td>{apt.patient_name}</td>
                                            <td>{apt.motif || "-"}</td>
                                            <td>
                                                <span className={`badge badge-${getStatusColor(apt.status)}`}>
                                                    {apt.status}
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
    );
};

// Helper for status colors
const getStatusColor = (status) => {
    switch (status) {
        case 'Confirmé': return 'success';
        case 'Planifié': return 'primary';
        case 'Annulé': return 'danger';
        case 'Terminé': return 'gray';
        default: return 'secondary';
    }
};

export default MedecinDashboard;
