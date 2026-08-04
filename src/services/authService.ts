import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dam-ai-guardian-ols0.onrender.com';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: { username: string; email: string; password: string; phoneNumber?: string; role?: string; status?: string }) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/auth/profile`);
    return response.data;
  },
  
  updateProfile: async (userData: { username?: string; email?: string; phoneNumber?: string }) => {
    const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, userData);
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/auth/users/pending`);
    return response.data;
  },

  updateUserStatus: async (userId: string, status: 'approved' | 'rejected') => {
    const response = await axios.put(`${API_BASE_URL}/api/auth/users/${userId}/status`, { status });
    return response.data;
  }
};

export default authService;
