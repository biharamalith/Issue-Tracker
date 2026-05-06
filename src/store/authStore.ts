import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.login(email, password);
      await storage.setAuth(user);
      set({ user, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message ?? 'Login failed', isLoading: false });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.register(email, password);
      await storage.setAuth(user);
      set({ user, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message ?? 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await storage.clearAuth();
    set({ user: null, error: null });
  },

  restoreSession: async () => {
    const user = await storage.getAuth();
    if (user) {
      set({ user });
      return true;
    }
    return false;
  },
}));
