/**
 * Sidebar Component - Navigation menu
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Calendar,
    FolderHeart,
    FileText,
    LogOut,
    Activity,
    UserCheck,
    Briefcase,
    DollarSign,
    Download,
    DownloadCloud
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (user?.role === 'medecin') {
            return [
                { path: '/medecin', icon: LayoutDashboard, label: 'Tableau de bord' },
                { path: '/patients', icon: Users, label: 'Mes Patients' },
                { path: '/rendez-vous', icon: Calendar, label: 'Mes Rendez-vous' },
                { path: '/dossiers', icon: FolderHeart, label: 'Dossiers Médicaux' },
            ];
        }

        const adminItems = [
            { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
            { path: '/patients', icon: Users, label: 'Patients' },
            { path: '/medecins', icon: Stethoscope, label: 'Médecins' },
            { path: '/secretaires', icon: UserCheck, label: 'Secrétaires' },
            { path: '/agents-acceuil', icon: Users, label: 'Agents d\'Acceuil' },
            { path: '/rendez-vous', icon: Calendar, label: 'Rendez-vous' },
            { path: '/dossiers', icon: FolderHeart, label: 'Dossiers Médicaux' },
            { path: '/contrats', icon: Briefcase, label: 'Contrats' },
            { path: '/revenus', icon: DollarSign, label: 'Revenus' },
            { path: '/download-requests', icon: DownloadCloud, label: 'Demandes de Téléchargement' },
            { path: '/acces', icon: Download, label: 'Accès' },
            { path: '/rapports', icon: FileText, label: 'Rapports' },
        ];

        return adminItems;
    };

    const navItems = getNavItems();

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <div className="loading">
                        <svg width="64px" height="48px">
                            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back"></polyline>
                            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front"></polyline>
                        </svg>
                    </div>
                </div>
                <div className="logo-text">
                    <h1>Clinique</h1>
                    <span>Gestion Médicale</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Section */}
            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.username || 'Utilisateur'}</span>
                        <span className="user-role">{user?.role || 'Admin'}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
