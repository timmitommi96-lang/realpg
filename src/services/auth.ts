import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export const authService = {
  async ensureProfile(nickname = 'Held'): Promise<boolean> {
    const { error } = await supabase.rpc('ensure_profile', { p_nickname: nickname });
    return !error;
  },

  async register(email: string, password: string): Promise<{ userId: string; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { userId: '', error: 'E-Mail bereits registriert' };
        }
        return { userId: '', error: error.message };
      }

      if (!data.user) {
        return { userId: '', error: 'Registrierung fehlgeschlagen' };
      }

      await this.ensureProfile(email.split('@')[0] || 'Held');
      return { userId: data.user.id, error: null };
    } catch (err: any) {
      return { userId: '', error: err.message };
    }
  },

  async login(email: string, password: string): Promise<{ userId: string; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login')) {
          return { userId: '', error: 'Ungültige E-Mail oder Passwort' };
        }
        return { userId: '', error: error.message };
      }

      if (!data.user) {
        return { userId: '', error: 'Anmeldung fehlgeschlagen' };
      }

      await this.ensureProfile(email.split('@')[0] || 'Held');
      return { userId: data.user.id, error: null };
    } catch (err: any) {
      return { userId: '', error: err.message };
    }
  },

  async getUser(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user || data.user.id !== userId) {
        return null;
      }

      return { id: data.user.id, email: data.user.email || '', created_at: data.user.created_at || '' };
    } catch {
      return null;
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }
    return {
      id: data.user.id,
      email: data.user.email || '',
      created_at: data.user.created_at || '',
    };
  }
};
