/**
 * Agent Sidebar Component - Navigation menu for agents d'acceuil
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    LogOut,
} from 'lucide-react';
import './Sidebar.css';

const AgentSidebar = () => {
    const { agentAcceuil, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/agent', icon: LayoutDashboard, label: 'Accueil' },
        { path: '/agent/patients', icon: Users, label: 'Patients' },
        { path: '/agent/rendez-vous', icon: Calendar, label: 'Rendez-vous' },
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
                    <h1>Espace Agent</h1>
                    <span>Accueil Médical</span>
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
                        {agentAcceuil?.prenom?.charAt(0) || agentAcceuil?.nom?.charAt(0) || 'A'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{agentAcceuil?.prenom} {agentAcceuil?.nom}</span>
                        <span className="user-role">Agent d'Accueil</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default AgentSidebar;