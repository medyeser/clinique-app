/**
 * Rapports Page - Reports and exports (PDF/Excel)
 */
import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Users,
    Stethoscope,
    Calendar,
    TrendingUp,
    FileSpreadsheet,
    File
} from 'lucide-react';
import { rapportsAPI } from '../services/api';
import Loading from '../components/Loading';
import './Rapports.css';

const Rapports = () => {
    const [stats, setStats] = useState(null);
    const [specialites, setSpecialites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, specRes] = await Promise.all([
                rapportsAPI.getGlobal(),
                rapportsAPI.getSpecialites()
            ]);
            setStats(statsRes.data);
            setSpecialites(specRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setExporting('pdf');
        try {
            const response = await rapportsAPI.exportPDF();
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport-clinique-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erreur lors de l\'export PDF');
        } finally {
            setExporting(null);
        }
    };

    const handleExportExcel = async () => {
        setExporting('excel');
        try {
            const response = await rapportsAPI.exportExcel();
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport-clinique-${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Erreur lors de l\'export Excel');
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="rapports-page">
            <div className="page-header">
                <h1>Rapports & Statistiques</h1>
                <div className="page-header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={handleExportExcel}
                        disabled={exporting === 'excel'}
                    >
                        <FileSpreadsheet size={18} />
                        {exporting === 'excel' ? 'Export...' : 'Export Excel'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleExportPDF}
                        disabled={exporting === 'pdf'}
                    >
                        <File size={18} />
                        {exporting === 'pdf' ? 'Export...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.total_patients || 0}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <Stethoscope size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.total_medecins || 0}</h3>
                        <p>Total Médecins</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.total_rendez_vous || 0}</h3>
                        <p>Total Rendez-vous</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{specialites.length}</h3>
                        <p>Spécialités actives</p>
                    </div>
                </div>
            </div>

            <div className="reports-grid">
                {/* Status Distribution */}
                <div className="card rapport-card">
                    <div className="card-header">
                        <h3>
                            <Calendar size={20} />
                            Répartition des Rendez-vous par Statut
                        </h3>
                    </div>
                    <div className="card-body">
                        {stats?.rendez_vous_par_statut?.length > 0 ? (
                            <div className="status-chart">
                                {stats.rendez_vous_par_statut.map((item, index) => {
                                    const total = stats.total_rendez_vous || 1;
                                    const percentage = ((item.count / total) * 100).toFixed(1);
                                    const colors = {
                                        'Planifié': 'var(--info)',
                                        'Confirmé': 'var(--success)',
                                        'Annulé': 'var(--error)',
                                        'Terminé': 'var(--primary-500)'
                                    };
                                    return (
                                        <div key={index} className="status-row">
                                            <div className="status-info">
                                                <span
                                                    className="status-dot"
                                                    style={{ background: colors[item.statut] || 'var(--gray-400)' }}
                                                />
                                                <span className="status-name">{item.statut}</span>
                                            </div>
                                            <div className="status-bar-wrapper">
                                                <div
                                                    className="status-bar-fill"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        background: colors[item.statut] || 'var(--gray-400)'
                                                    }}
                                                />
                                            </div>
                                            <div className="status-stats">
                                                <span className="count">{item.count}</span>
                                                <span className="percentage">({percentage}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Calendar size={48} />
                                <p>Aucune donnée disponible</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Specialties Ranking */}
                <div className="card rapport-card">
                    <div className="card-header">
                        <h3>
                            <Stethoscope size={20} />
                            Spécialités les plus sollicitées
                        </h3>
                    </div>
                    <div className="card-body">
                        {specialites.length > 0 ? (
                            <div className="specialites-ranking">
                                {specialites.map((item, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="rank">#{index + 1}</span>
                                        <div className="ranking-info">
                                            <span className="specialite-name">{item.specialite || 'Non spécifié'}</span>
                                            <span className="specialite-count">{item.count} consultation(s)</span>
                                        </div>
                                        <div className="ranking-badge">
                                            {index === 0 && <span className="badge badge-success">Top</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Stethoscope size={48} />
                                <p>Aucune donnée disponible</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Report Info */}
                <div className="card rapport-card full-width">
                    <div className="card-header">
                        <h3>
                            <FileText size={20} />
                            Information du Rapport
                        </h3>
                    </div>
                    <div className="card-body">
                        <div className="report-info-grid">
                            <div className="report-info-item">
                                <span className="label">Date de génération</span>
                                <span className="value">
                                    {stats?.date_generation
                                        ? new Date(stats.date_generation).toLocaleString('fr-FR')
                                        : new Date().toLocaleString('fr-FR')
                                    }
                                </span>
                            </div>
                            <div className="report-info-item">
                                <span className="label">Période</span>
                                <span className="value">Toutes les données</span>
                            </div>
                            <div className="report-info-item">
                                <span className="label">Format disponibles</span>
                                <span className="value">PDF, Excel (XLSX)</span>
                            </div>
                        </div>

                        <div className="export-section">
                            <h4>Exporter les données</h4>
                            <p>Téléchargez un rapport complet de toutes les données de la clinique.</p>
                            <div className="export-buttons">
                                <button
                                    className="export-btn pdf"
                                    onClick={handleExportPDF}
                                    disabled={exporting === 'pdf'}
                                >
                                    <File size={24} />
                                    <div>
                                        <span className="export-title">Rapport PDF</span>
                                        <span className="export-desc">Document formaté pour impression</span>
                                    </div>
                                    <Download size={18} />
                                </button>
                                <button
                                    className="export-btn excel"
                                    onClick={handleExportExcel}
                                    disabled={exporting === 'excel'}
                                >
                                    <FileSpreadsheet size={24} />
                                    <div>
                                        <span className="export-title">Rapport Excel</span>
                                        <span className="export-desc">Données tabulaires (XLSX)</span>
                                    </div>
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rapports;
