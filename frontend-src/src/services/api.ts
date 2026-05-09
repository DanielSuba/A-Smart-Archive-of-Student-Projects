import axios from 'axios';

// In dev: Vite proxy forwards /api → http://localhost:8000
// In prod (Docker): Nginx proxy forwards /api → backend service
const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: API_BASE });

// Funkcja służy do dodawania tokenu autoryzacji do każdego requestu API.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  // Funkcja służy do zwracania poprawnej odpowiedzi API bez zmian.
  (r) => r,
  // Funkcja służy do obsługi błędów API i wylogowania po odpowiedzi 401.
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
// Funkcja służy do wysyłania requestu rejestracji użytkownika.
export const register = (data: any) => api.post('/api/auth/register', data);
// Funkcja służy do wysyłania requestu logowania użytkownika.
export const login = (data: any) => api.post('/api/auth/login', data);
// Funkcja służy do pobierania danych aktualnego użytkownika.
export const getMe = () => api.get('/api/auth/me');
// Funkcja służy do aktualizacji kontaktów aktualnego użytkownika.
export const updateMyContacts = (data: { facebook?: string; discord?: string; github?: string; linkedin?: string }) =>
  api.put('/api/auth/me/contacts', data);

// Projects
// Funkcja służy do pobierania listy projektów z parametrami filtrowania.
export const getProjects = (params?: any) => api.get('/api/projects', { params });
// Funkcja służy do pobierania projektów aktualnego użytkownika.
export const getMyProjects = (params?: any) => api.get('/api/projects/my', { params });
// Funkcja służy do pobierania szczegółów projektu po identyfikatorze.
export const getProject = (id: number) => api.get(`/api/projects/${id}`);
// Funkcja służy do tworzenia projektu z danymi formularza.
export const createProject = (data: FormData) => api.post('/api/projects', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
// Funkcja służy do aktualizowania danych projektu.
export const updateProject = (id: number, data: FormData) => api.put(`/api/projects/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
// Funkcja służy do usuwania projektu.
export const deleteProject = (id: number) => api.delete(`/api/projects/${id}`);
// Funkcja służy do ponownego uruchamiania analizy projektu.
export const analyzeProject = (id: number) => api.post(`/api/projects/${id}/analyze`);

// Profile
// Funkcja służy do pobierania profilu kompetencji aktualnego użytkownika.
export const getMyProfile = () => api.get('/api/profile');
// Funkcja służy do pobierania profilu kompetencji wybranego użytkownika.
export const getUserProfile = (id: number) => api.get(`/api/profile/${id}`);

// Portfolio
// Funkcja służy do pobierania portfolio aktualnego użytkownika.
export const getMyPortfolios = () => api.get('/api/portfolios/my');
// Funkcja służy do tworzenia nowego portfolio.
export const createPortfolio = (data: any) => api.post('/api/portfolios', data);
// Funkcja służy do pobierania publicznego portfolio po slugu.
export const getPortfolio = (slug: string) => api.get(`/api/portfolios/${slug}`);
// Funkcja służy do usuwania portfolio.
export const deletePortfolio = (id: number) => api.delete(`/api/portfolios/${id}`);

// Technologies
// Funkcja służy do pobierania listy technologii.
export const getTechnologies = () => api.get('/api/technologies');
