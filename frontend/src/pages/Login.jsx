/**
 * Login Page - User authentication
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, secretaireLogin, agentAcceuilLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Try admin/user login first
        let result = await login(username, password);
        
        // If admin login fails, try secretaire login
        if (!result.success) {
            result = await secretaireLogin(username, password);
        }
        
        // If secretaire login fails, try agent acceuil login
        if (!result.success) {
            result = await agentAcceuilLogin(username, password);
        }

        if (result.success) {
            // Navigate based on user type
            const userType = localStorage.getItem('userType');
            if (userType === 'secretaire') {
                navigate('/secretaire');
            } else if (userType === 'agent_acceuil') {
                navigate('/agent');
            } else {
                navigate('/');
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left side - Branding */}
                <div className="login-branding">
                    <div className="branding-content">
                        <div className="brand-row">
                            <div className="logo">
                                <div className="loading">
                                    <svg width="64px" height="48px">
                                        <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back"></polyline>
                                        <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <h1>Clinique Médicale</h1>
                        </div>
                        <p>Système de Gestion Médicale</p>
                        <ul className="features">
                            <li>✓ Gestion des patients</li>
                            <li>✓ Planification des rendez-vous</li>
                            <li>✓ Dossiers médicaux numériques</li>
                            <li>✓ Rapports et statistiques</li>
                        </ul>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="login-form-container">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h2>Connexion</h2>
                            <p>Entrez vos identifiants pour accéder au système</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Nom d'utilisateur ou Email</label>
                            <div className="input-with-icon">
                                <User size={18} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Entrez votre nom d'utilisateur ou email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mot de passe</label>
                            <div className="input-with-icon">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Entrez votre mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>


                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
