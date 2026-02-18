/**
 * Authentication Context for managing user state
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [secretaire, setSecretaire] = useState(null);
    const [agentAcceuil, setAgentAcceuil] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userType, setUserType] = useState(localStorage.getItem('userType') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const storedUserType = localStorage.getItem('userType');
                    if (storedUserType === 'secretaire') {
                        const response = await authAPI.getSecretaireMe();
                        setSecretaire(response.data);
                        setUserType('secretaire');
                    } else if (storedUserType === 'agent_acceuil') {
                        const response = await authAPI.getAgentAcceuilMe();
                        setAgentAcceuil(response.data);
                        setUserType('agent_acceuil');
                    } else {
                        const response = await authAPI.getMe();
                        setUser(response.data);
                        setUserType('user');
                    }
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await authAPI.login(username, password);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('userType', 'user');
            setToken(access_token);
            setUserType('user');

            // Get user info
            const userResponse = await authAPI.getMe();
            setUser(userResponse.data);
            localStorage.setItem('user', JSON.stringify(userResponse.data));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Erreur de connexion'
            };
        }
    };

    const secretaireLogin = async (email, password) => {
        try {
            const response = await authAPI.secretaireLogin(email, password);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('userType', 'secretaire');
            setToken(access_token);
            setUserType('secretaire');

            // Get secretaire info
            const secretaireResponse = await authAPI.getSecretaireMe();
            setSecretaire(secretaireResponse.data);
            localStorage.setItem('secretaire', JSON.stringify(secretaireResponse.data));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Erreur de connexion'
            };
        }
    };

    const agentAcceuilLogin = async (email, password) => {
        try {
            const response = await authAPI.agentAcceuilLogin(email, password);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('userType', 'agent_acceuil');
            setToken(access_token);
            setUserType('agent_acceuil');

            // Get agent acceuil info
            const agentResponse = await authAPI.getAgentAcceuilMe();
            setAgentAcceuil(agentResponse.data);
            localStorage.setItem('agentAcceuil', JSON.stringify(agentResponse.data));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Erreur de connexion'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('secretaire');
        localStorage.removeItem('agentAcceuil');
        localStorage.removeItem('userType');
        setToken(null);
        setUser(null);
        setSecretaire(null);
        setAgentAcceuil(null);
        setUserType(null);
    };

    const value = {
        user,
        secretaire,
        agentAcceuil,
        token,
        userType,
        loading,
        isAuthenticated: !!token && (!!user || !!secretaire || !!agentAcceuil),
        isSecretaire: userType === 'secretaire',
        isAgentAcceuil: userType === 'agent_acceuil',
        isMedecin: userType === 'user' && user?.role === 'medecin',
        login,
        secretaireLogin,
        agentAcceuilLogin,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
