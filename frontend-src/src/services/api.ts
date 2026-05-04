import axios from 'axios';

// In dev: Vite proxy forwards /api → http://localhost:8000
// In prod (Docker): Nginx proxy forwards /api → backend service
const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
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
export const register = (data: any) => api.post('/api/auth/register', data);
export const login = (data: any) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');

// Projects
export const getProjects = (params?: any) => api.get('/api/projects', { params });
export const getMyProjects = (params?: any) => api.get('/api/projects/my', { params });
export const getProject = (id: number) => api.get(`/api/projects/${id}`);
export const createProject = (data: FormData) => api.post('/api/projects', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProject = (id: number, data: any) => api.put(`/api/projects/${id}`, data);
export const deleteProject = (id: number) => api.delete(`/api/projects/${id}`);
export const analyzeProject = (id: number) => api.post(`/api/projects/${id}/analyze`);

// Profile
export const getMyProfile = () => api.get('/api/profile');
export const getUserProfile = (id: number) => api.get(`/api/profile/${id}`);

// Portfolio
export const getMyPortfolios = () => api.get('/api/portfolios/my');
export const createPortfolio = (data: any) => api.post('/api/portfolios', data);
export const getPortfolio = (slug: string) => api.get(`/api/portfolios/${slug}`);
export const deletePortfolio = (id: number) => api.delete(`/api/portfolios/${id}`);

// Technologies
export const getTechnologies = () => api.get('/api/technologies');
