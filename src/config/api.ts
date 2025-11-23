// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
      REGISTER: `${API_BASE_URL}/api/auth/register`,
    },
    REPORTS: {
      LIST: `${API_BASE_URL}/api/reports`,
      VOTE: (id: string) => `${API_BASE_URL}/api/reports/${id}/vote`,
    },
    USER: {
      GET: (id: string) => `${API_BASE_URL}/api/user/${id}`,
      UPDATE: (id: string) => `${API_BASE_URL}/api/user/${id}`,
    },
    UPLOAD: `${API_BASE_URL}/api/upload`,
  },
};

export default API_CONFIG;
