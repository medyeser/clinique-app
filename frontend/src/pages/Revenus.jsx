/**
 * Revenus Page - Revenue tracking and reporting
 */
import { useState, useEffect } from 'react';
import {
    DollarSign,
    Calendar,
    TrendingUp,
    Download,
    FileText,
    Filter,
    BarChart3
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line
} from 'recharts';
import { revenusAPI } from '../services/api';
import Loading from '../components/Loading';
import './Revenus.css';

const Revenus = () => {
    const [loading, setLoading] = useState(true);
    const [dailyRevenue, setDailyRevenue] = useState(null);
    const [weeklyRevenue, setWeeklyRevenue] = useState(null);
    const [monthlyRevenue, setMonthlyRevenue] = useState(null);
    const [history, setHistory] = useState([]);

    // Filters
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(getFirstDayOfMonth());
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('day'); // day, week, month

    useEffect(() => {
        fetchData();
    }, [selectedDate, viewMode]);

    function getFirstDayOfMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch based on view mode
            if (viewMode === 'day') {
                const dailyRes = await revenusAPI.getDaily(selectedDate);
                setDailyRevenue(dailyRes.data);
            } else if (viewMode === 'week') {
                const weeklyRes = await revenusAPI.getWeekly(selectedDate);
                setWeeklyRevenue(weeklyRes.data);
            } else if (viewMode === 'month') {
                const date = new Date(selectedDate);
                const monthlyRes = await revenusAPI.getMonthly(date.getFullYear(), date.getMonth() + 1);
                setMonthlyRevenue(monthlyRes.data);
            }

            // Always fetch history for the selected period
            await fetchHistory();
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const historyRes = await revenusAPI.getHistory(startDate, endDate);
            setHistory(historyRes.data.history || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await revenusAPI.exportPDF(startDate, endDate);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rapport_revenus_${startDate}_${endDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erreur lors de l\'export PDF');
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await revenusAPI.exportExcel(startDate, endDate);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rapport_revenus_${startDate}_${endDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Erreur lors de l\'export Excel');
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="revenus-page">
            <div className="page-header">
                <div>
                    <h1>Gestion des Revenus</h1>
                    <p className="page-subtitle">Suivi et analyse des revenus de la clinique</p>
                </div>
                <div className="header-actions">
                    <button onClick={handleExportPDF} className="btn btn-secondary">
                        <FileText size={18} />
                        Export PDF
                    </button>
                    <button onClick={handleExportExcel} className="btn btn-primary">
                        <Download size={18} />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* View Mode Selector */}
            <div className="view-mode-selector">
                <button
                    className={`mode-btn ${viewMode === 'day' ? 'active' : ''}`}
                    onClick={() => setViewMode('day')}
                >
                    <Calendar size={18} />
                    Par Jour
                </button>
                <button
                    className={`mode-btn ${viewMode === 'week' ? 'active' : ''}`}
                    onClick={() => setViewMode('week')}
                >
                    <BarChart3 size={18} />
                    Par Semaine
                </button>
                <button
                    className={`mode-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                >
                    <TrendingUp size={18} />
                    Par Mois
                </button>
            </div>

            {/* Date Selector */}
            <div className="date-selector">
                <div className="form-group">
                    <label>Sélectionner une date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="form-control"
                    />
                </div>
            </div>

            {/* Revenue Summary Cards */}
            {viewMode === 'day' && dailyRevenue && (
                <div className="revenue-summary">
                    <div className="stat-card">
                        <div className="stat-icon green">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{dailyRevenue.total_revenue} DT</h3>
                            <p>Revenus du {new Date(dailyRevenue.date).toLocaleDateString('fr-FR')}</p>
                            <span className="stat-trend">{dailyRevenue.total_consultations} consultations</span>
                        </div>
                    </div>

                    {/* Revenue by Doctor */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Revenus par Médecin</h3>
                        </div>
                        <div className="card-body">
                            {dailyRevenue.medecins && dailyRevenue.medecins.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Médecin</th>
                                                <th>Spécialité</th>
                                                <th className="text-center">Consultations</th>
                                                <th className="text-center">Revenus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dailyRevenue.medecins.map((med, idx) => (
                                                <tr key={idx}>
                                                    <td className="font-medium">{med.medecin_nom}</td>
                                                    <td className="text-muted">{med.specialite}</td>
                                                    <td className="text-center">{med.nb_consultations}</td>
                                                    <td className="text-center font-bold text-success">{med.revenue} DT</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted">Aucune consultation pour cette journée</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'week' && weeklyRevenue && (
                <div className="revenue-summary">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{weeklyRevenue.total_revenue} DT</h3>
                            <p>Revenus de la semaine</p>
                            <span className="stat-trend">
                                {new Date(weeklyRevenue.week_start).toLocaleDateString('fr-FR')} - {new Date(weeklyRevenue.week_end).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Revenus Quotidiens de la Semaine</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={weeklyRevenue.daily_breakdown}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day_name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `${value} DT`} />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Revenus (DT)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'month' && monthlyRevenue && (
                <div className="revenue-summary">
                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{monthlyRevenue.total_revenue} DT</h3>
                            <p>Revenus de {monthlyRevenue.month_name} {monthlyRevenue.year}</p>
                            <span className="stat-trend">{monthlyRevenue.total_consultations} consultations</span>
                        </div>
                    </div>

                    {/* Monthly Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Évolution des Revenus du Mois</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={monthlyRevenue.daily_breakdown}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `${value} DT`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" name="Revenus (DT)" stroke="#8b5cf6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Historical Data */}
            <div className="card">
                <div className="card-header">
                    <h3><Filter size={20} /> Historique des Revenus</h3>
                </div>
                <div className="card-body">
                    {/* Date Range Filter */}
                    <div className="filter-row">
                        <div className="form-group">
                            <label>Date de début</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date de fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <button onClick={fetchHistory} className="btn btn-primary">
                            Rechercher
                        </button>
                    </div>

                    {/* History Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Heure</th>
                                    <th>Médecin</th>
                                    <th>Spécialité</th>
                                    <th>Patient</th>
                                    <th>Titre</th>
                                    <th className="text-center">Revenu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id}>
                                            <td>{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                                            <td>{item.heure}</td>
                                            <td className="font-medium">{item.medecin}</td>
                                            <td className="text-muted text-sm">{item.specialite}</td>
                                            <td>{item.patient}</td>
                                            <td>{item.titre}</td>
                                            <td className="text-center font-bold text-success">{item.revenue} DT</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted">
                                            Aucune consultation trouvée pour cette période
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenus;
