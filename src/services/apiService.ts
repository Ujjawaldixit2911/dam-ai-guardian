import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dam-ai-guardian-ols0.onrender.com';

// Add a request interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('dam_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ========================================
// Government Integration Service
// ========================================
export const governmentService = {
  getNDMAAlerts: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/government/ndma-alerts`);
    return response.data;
  },

  getIMDWeather: async (location: string = 'Tehri') => {
    const response = await axios.get(`${API_BASE_URL}/api/government/imd-weather`, {
      params: { location }
    });
    return response.data;
  },

  getCWCData: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/government/cwc-data`);
    return response.data;
  },

  submitComplianceReport: async (reportType: string, agency: string, data: any, attachments?: any[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/government/compliance-report`, {
      reportType,
      agency,
      data,
      attachments
    });
    return response.data;
  },

  syncWithAgencies: async (agencies: string[]) => {
    const response = await axios.post(`${API_BASE_URL}/api/government/sync`, {
      agencies
    });
    return response.data;
  }
};

// ========================================
// Chatbot Service
// ========================================
export const chatbotService = {
  sendMessage: async (message: string, language: string = 'en', conversationId?: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/chatbot/message`, {
      message,
      language,
      conversationId
    });
    return response.data;
  },

  getFAQs: async (language: string = 'en', category?: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/chatbot/faq`, {
      params: { language, category }
    });
    return response.data;
  }
};

export default {
  governmentService,
  chatbotService
};
