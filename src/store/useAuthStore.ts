import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    // DEMO MODE: Bypass Supabase Auth completely for presentation
    const mockUser = {
      id: 'demo-user-1234-5678-90ab-cdef12345678',
      email: 'demo@digiproof.com',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const mockProfile = {
      id: mockUser.id,
      full_name: 'Naufal Ramzi - 202310370311026 - Kriptografi B',
      role: 'admin',
      avatar_url: null
    };

    set({
      user: mockUser as User,
      profile: mockProfile,
      isInitialized: true,
      isLoading: false
    });
  },
  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, profile: null, isLoading: false });
  }
}));
