import axios from 'axios';

const getApiBase = (): string => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const envUrl = (import.meta.env.VITE_API_URL as string) || '';
    if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return envUrl;
    }
    return 'http://localhost:3001';
  }
  return (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';
};

const envBase = getApiBase();
export const API_ORIGIN = envBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const API_BASE = envBase.endsWith('/api') ? envBase : `${envBase.replace(/\/+$/, '')}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('colorido_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('colorido_admin_token');
      localStorage.removeItem('colorido_admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ── Public API ───────────────────────────────────────────────────
export const getEvents = (params?: Record<string, unknown>) => api.get('/events', { params });
export const getPopularEvents = () => api.get('/events/popular');
export const getEvent = (idOrSlug: string) => api.get(`/events/${idOrSlug}`);
export const getCategories = () => api.get('/categories');
export const getSchedule = (params?: Record<string, unknown>) => api.get('/schedule', { params });
export const getAnnouncements = (params?: Record<string, unknown>) => api.get('/announcements', { params });
export const getTickerAnnouncements = () => api.get('/announcements', { params: { ticker_only: 'true' } });
export const getResults = (params?: Record<string, unknown>) => api.get('/results', { params });
export const getGallery = (params?: Record<string, unknown>) => api.get('/gallery', { params });
export const getSponsors = () => api.get('/sponsors');
export const getContact = () => api.get('/contact');
export const getPublicConfig = () => api.get('/config');

// ── File Upload ───────────────────────────────────────────────────
export const uploadAudioFile = async (file: File) => {
  const formData = new FormData();
  formData.append('audio', file);
  const res = await api.post('/upload/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ── Registration ──────────────────────────────────────────────────
export const registerForEvent = async (data: unknown): Promise<any> => {
  try {
    const res = await api.post('/registrations', data);
    return res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || 'Registration failed';
    throw new Error(msg);
  }
};
export const getRegistrationByNumber = (regNumber: string) => api.get(`/registrations/${regNumber}`);

// ── Auth ──────────────────────────────────────────────────────────
export const adminLogin = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// ── Admin ─────────────────────────────────────────────────────────
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminRegistrations = (params?: Record<string, unknown>) =>
  api.get('/admin/registrations', { params });
export const getAdminRegistration = (id: string) => api.get(`/admin/registrations/${id}`);
export const updateRegistrationStatus = (id: string, status: string, notes?: string) =>
  api.patch(`/admin/registrations/${id}/status`, { status, notes });

export const getAdminEvents = () => api.get('/admin/events');
export const createEvent = (data: unknown) => api.post('/admin/events', data);
export const updateEvent = (id: string, data: unknown) => api.patch(`/admin/events/${id}`, data);
export const deleteEvent = (id: string) => api.delete(`/admin/events/${id}`);

export const getAdminAnnouncements = () => api.get('/admin/announcements');
export const createAnnouncement = (data: unknown) => api.post('/admin/announcements', data);
export const updateAnnouncement = (id: string, data: unknown) => api.patch(`/admin/announcements/${id}`, data);
export const deleteAnnouncement = (id: string) => api.delete(`/admin/announcements/${id}`);

export const getAdminSchedule = () => api.get('/admin/schedule');
export const createScheduleItem = (data: unknown) => api.post('/admin/schedule', data);
export const updateScheduleItem = (id: string, data: unknown) => api.patch(`/admin/schedule/${id}`, data);
export const deleteScheduleItem = (id: string) => api.delete(`/admin/schedule/${id}`);

export const getAdminResults = () => api.get('/admin/results');
export const createResult = (data: unknown) => api.post('/admin/results', data);
export const updateResult = (id: string, data: unknown) => api.patch(`/admin/results/${id}`, data);
export const deleteResult = (id: string) => api.delete(`/admin/results/${id}`);

export const getAdminGallery = () => api.get('/admin/gallery');
export const createGalleryItem = (data: unknown) => api.post('/admin/gallery', data);
export const updateGalleryItem = (id: string, data: unknown) => api.patch(`/admin/gallery/${id}`, data);
export const deleteGalleryItem = (id: string) => api.delete(`/admin/gallery/${id}`);

export const getAdminSponsors = () => api.get('/admin/sponsors');
export const createSponsor = (data: unknown) => api.post('/admin/sponsors', data);
export const updateSponsor = (id: string, data: unknown) => api.patch(`/admin/sponsors/${id}`, data);
export const deleteSponsor = (id: string) => api.delete(`/admin/sponsors/${id}`);

export const getSiteConfig = () => api.get('/admin/config');
export const updateSiteConfig = (key: string, value: string) =>
  api.patch(`/admin/config/${key}`, { value });
