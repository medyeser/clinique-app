/**
 * Agent Login Page - Agent d'acceuil authentication
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const AgentLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { agentAcceuilLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await agentAcceuilLogin(email, password);

        if (result.success) {
            navigate('/agent');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
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
                        </div>
                        <h1>Connexion Agent d'Accueil</h1>
                        <p>Accédez à votre espace de gestion</p>
                    </div>
                </div>

                <div className="login-form-container">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-header">
                            <h2>Bienvenue</h2>
                            <p>Entrez vos identifiants pour continuer</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-with-icon">
                                <User size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre.email@clinique.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <div className="input-with-icon">
                                <Lock size={18} />
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Votre mot de passe"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>

                        <div className="demo-credentials">
                            <p>Clinique Médicale - Espace Agent d'Accueil</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgentLogin;