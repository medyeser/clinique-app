/**
 * API Configuration for Medical Clinic Backend
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clean all authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('secretaire');
            localStorage.removeItem('agentAcceuil');
            localStorage.removeItem('userType');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        return axios.post('http://localhost:8000/api/auth/login', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },
    secretaireLogin: (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 uses 'username' field
        formData.append('password', password);
        return axios.post('http://localhost:8000/api/auth/secretaire/login', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },
    agentAcceuilLogin: (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 uses 'username' field
        formData.append('password', password);
        return axios.post('http://localhost:8000/api/auth/agent-acceuil/login', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },
    register: (userData) => api.post('/api/auth/register', userData),
    getMe: () => api.get('/api/auth/me'),
    getSecretaireMe: () => api.get('/api/auth/secretaire/me'),
    getAgentAcceuilMe: () => api.get('/api/auth/agent-acceuil/me'),
};

// Secretaire Dashboard API
export const secretaireDashboardAPI = {
    getRendezVous: (skip = 0, limit = 100) => api.get(`/api/secretaire/rendez-vous?skip=${skip}&limit=${limit}`),
    getPatients: (skip = 0, limit = 100) => api.get(`/api/secretaire/patients?skip=${skip}&limit=${limit}`),
    getDossiers: (skip = 0, limit = 100) => api.get(`/api/secretaire/dossiers?skip=${skip}&limit=${limit}`),
    getDossierByPatient: (patientId) => api.get(`/api/secretaire/dossiers/patient/${patientId}`),
    getMedecins: () => api.get('/api/secretaire/medecins'),
};

// Patients API
export const patientsAPI = {
    getAll: (skip = 0, limit = 100) => api.get(`/api/patients/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/api/patients/${id}`),
    search: (query) => api.get(`/api/patients/search?q=${query}`),
    create: (data) => api.post('/api/patients/', data),
    update: (id, data) => api.put(`/api/patients/${id}`, data),
    delete: (id) => api.delete(`/api/patients/${id}`),
    exportPatientsPDF: () => api.get('/api/patients/export/pdf', { responseType: 'blob' }),
    exportPatientsExcel: () => api.get('/api/patients/export/excel', { responseType: 'blob' }),
};

// Médecins API
export const medecinsAPI = {
    getAll: (skip = 0, limit = 100) => api.get(`/api/medecins/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/api/medecins/${id}`),
    search: (query, specialite) => {
        let url = `/api/medecins/search?`;
        if (query) url += `q=${query}&`;
        if (specialite) url += `specialite=${specialite}`;
        return api.get(url);
    },
    create: (data) => api.post('/api/medecins/', data),
    update: (id, data) => api.put(`/api/medecins/${id}`, data),
    delete: (id) => api.delete(`/api/medecins/${id}`),
};

// Rendez-vous API
export const rendezVousAPI = {
    getAll: (skip = 0, limit = 100) => api.get(`/api/rendez-vous/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/api/rendez-vous/${id}`),
    getByDay: (date) => api.get(`/api/rendez-vous/jour/${date}`),
    getByPatient: (patientId) => api.get(`/api/rendez-vous/patient/${patientId}`),
    checkConflict: (medecinId, dateHeure, dureeMinutes = 30) =>
        api.post('/api/rendez-vous/verifier-conflit', { medecin_id: medecinId, date_heure: dateHeure, duree_minutes: dureeMinutes }),
    create: (data) => api.post('/api/rendez-vous/', data),
    update: (id, data) => api.put(`/api/rendez-vous/${id}`, data),
    delete: (id) => api.delete(`/api/rendez-vous/${id}`),
};

// Dossiers Médicaux API
export const dossiersAPI = {
    getByPatient: (patientId) => api.get(`/api/dossiers/patient/${patientId}`),
    getById: (id) => api.get(`/api/dossiers/${id}`),
    getHistorique: (id) => api.get(`/api/dossiers/${id}/historique`),
    create: (data) => api.post('/api/dossiers/', data),
    update: (id, data) => api.put(`/api/dossiers/${id}`, data),
    addObservation: (id, observation) => api.post(`/api/dossiers/${id}/observations`, observation),
};

// Rapports API
export const rapportsAPI = {
    getGlobal: () => api.get('/api/rapports/global'),
    getSpecialites: () => api.get('/api/rapports/specialites'),
    exportPDF: () => api.get('/api/rapports/export/pdf', { responseType: 'blob' }),
    exportExcel: () => api.get('/api/rapports/export/excel', { responseType: 'blob' }),
    exportPatientsPDF: () => api.get('/api/rapports/patients/export/pdf', { responseType: 'blob' }),
    exportPatientsExcel: () => api.get('/api/rapports/patients/export/excel', { responseType: 'blob' }),
    getMedecinsStats: () => api.get('/api/rapports/medecins'),
    getRdvStats: () => api.get('/api/rapports/rendez-vous'),
    getMedicalStats: () => api.get('/api/rapports/medicales'),
};

// Consultations API
export const consultationsAPI = {
    create: (dossierId, data) => api.post(`/api/consultations/dossier/${dossierId}`, data),
    getByDossier: (dossierId) => api.get(`/api/consultations/dossier/${dossierId}`),
    update: (id, data) => api.put(`/api/consultations/${id}`, data),
    delete: (id) => api.delete(`/api/consultations/${id}`),
    downloadPDF: (id) => api.get(`/api/consultations/${id}/pdf`, { responseType: 'blob' }),
    exportHistory: (dossierId) => api.get(`/api/consultations/dossier/${dossierId}/export/csv`, { responseType: 'blob' }),
};

// Secrétaires API
export const secretairesAPI = {
    getAll: (skip = 0, limit = 100) => api.get(`/api/secretaires/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/api/secretaires/${id}`),
    search: (query) => api.get(`/api/secretaires/search?q=${query}`),
    create: (data) => api.post('/api/secretaires/', data),
    update: (id, data) => api.put(`/api/secretaires/${id}`, data),
    delete: (id) => api.delete(`/api/secretaires/${id}`),
};

// Agents d'Acceuil API
export const agentsAcceuilAPI = {
    getAll: (skip = 0, limit = 100) => api.get(`/api/agents-acceuil/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/api/agents-acceuil/${id}`),
    search: (query) => api.get(`/api/agents-acceuil/search?q=${query}`),
    create: (data) => api.post('/api/agents-acceuil/', data),
    update: (id, data) => api.put(`/api/agents-acceuil/${id}`, data),
    delete: (id) => api.delete(`/api/agents-acceuil/${id}`),
};


// Medecin Dashboard API
export const medecinDashboardAPI = {
    getStats: () => api.get('/api/medecin/dashboard/stats'),
    getAppointments: () => api.get('/api/medecin/dashboard/appointments'),
    getGraph: () => api.get('/api/medecin/dashboard/graph'),
};
// Contrats API
export const contratsAPI = {
    getAll: (skip = 0, limit = 100) => api.get(`/api/contrats/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/api/contrats/${id}`),
    create: (data) => api.post('/api/contrats/', data),
    update: (id, data) => api.put(`/api/contrats/${id}`, data),
    delete: (id) => api.delete(`/api/contrats/${id}`),
    downloadPDF: (id) => api.get(`/api/contrats/${id}/pdf`, { responseType: 'blob' }),
};

// Revenus API
export const revenusAPI = {
    getDaily: (date) => api.get('/api/revenus/daily', { params: { date_param: date } }),
    getWeekly: (date) => api.get('/api/revenus/weekly', { params: { date_param: date } }),
    getMonthly: (year, month) => api.get('/api/revenus/monthly', { params: { year, month } }),
    getHistory: (startDate, endDate) => api.get('/api/revenus/history', { params: { start_date: startDate, end_date: endDate } }),
    exportPDF: (startDate, endDate) => api.get('/api/revenus/export/pdf', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
    }),
    exportExcel: (startDate, endDate) => api.get('/api/revenus/export/excel', {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
    }),
};

// Accès API
export const accesAPI = {
    getAll: (skip = 0, limit = 100) => api.get(`/api/acces/?skip=${skip}&limit=${limit}`),
    getById: (id) => api.get(`/api/acces/${id}`),
    create: (data) => api.post('/api/acces/', data),
    update: (id, data) => api.put(`/api/acces/${id}`, data),
    delete: (id) => api.delete(`/api/acces/${id}`),
};

export default api;
