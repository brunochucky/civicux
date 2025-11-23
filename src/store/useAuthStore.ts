import { create } from 'zustand';
import API_CONFIG from '@/config/api';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  address?: string;
  education?: string;
  profession?: string;
  age?: number;
  whatsapp?: string;
  receiveUpdates?: boolean;
  notificationChannel?: string;
  interests?: string[];
  subscribedThemes?: string[];
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User> & { currentPassword?: string; newPassword?: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
          }
          
          const data = await response.json();
          const { token, ...user } = data;
          set({ isAuthenticated: true, user, token });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      register: async (name, email, password) => {
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
          }
          
          const data = await response.json();
          const { token, ...user } = data;
          set({ isAuthenticated: true, user, token });
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },
      fetchUser: async (userId) => {
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.USER.GET(userId));
          
          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }
          
          const user = await response.json();
          set({ user });
        } catch (error) {
          console.error('Fetch user error:', error);
        }
      },
      updateProfile: async (userId, data) => {
        const token = get().token;
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.USER.UPDATE(userId), {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update profile');
          }

          const { user } = await response.json();
          set({ user });
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
