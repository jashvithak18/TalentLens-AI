import axios from 'axios';
import { store } from '../redux/store';
import { logout, setCredentials } from '../redux/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://talentlens-ai-e57l.onrender.com/api',
});

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-Refresh Expired Tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 and code is TOKEN_EXPIRED (or similar expired indication)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const res = await axios.post(`${import.meta.env.VITE_API_URL || 'https://talentlens-ai-e57l.onrender.com/api'}/auth/refresh`, { refreshToken });
          
          if (res.data.success) {
            // Update Redux state & localStorage
            store.dispatch(setCredentials({
              token: res.data.token,
              user: storedUser,
              profile: JSON.parse(localStorage.getItem('profile'))
            }));

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token failed -> Force Logout
        store.dispatch(logout());
        localStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
// Helper routes definitions
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleLogin: (data) => api.post('/auth/google-login', data),
  logout: () => api.post('/auth/logout'),
};
