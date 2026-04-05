import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stovmbgqzjsjohgkwbkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0b3ZtYmdxempzam9oZ2t3YmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDIzNjIsImV4cCI6MjA5MDk3ODM2Mn0.rCrD31CF2SzXMPod0S7fzCkrx1-pReMNLeTwy1eL0K4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export const authService = {
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

      return { userId: data.user.id, error: null };
    } catch (err: any) {
      return { userId: '', error: err.message };
    }
  },

  async getUser(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.getUser(userId);

      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at || '',
      };
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
