import axios from 'axios';
import API_CONFIG from '@/config/api';

export const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api`,
});
