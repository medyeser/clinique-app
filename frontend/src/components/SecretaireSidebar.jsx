/**
 * Secretaire Sidebar Component - Navigation menu for secretaires
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FolderHeart,
    LogOut,
} from 'lucide-react';
import './Sidebar.css';

const SecretaireSidebar = () => {
    const { secretaire, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/secretaire', icon: LayoutDashboard, label: 'Accueil' },
        { path: '/secretaire/patients', icon: Users, label: 'Patients' },
        { path: '/secretaire/rendez-vous', icon: Calendar, label: 'Rendez-vous' },
        { path: '/secretaire/dossiers', icon: FolderHeart, label: 'Dossiers Médicaux' },
    ];

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
                    <h1>Espace Secrétaire</h1>
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
                        {secretaire?.prenom?.charAt(0) || secretaire?.nom?.charAt(0) || 'S'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{secretaire?.prenom} {secretaire?.nom}</span>
                        <span className="user-role">Secrétaire</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default SecretaireSidebar;

