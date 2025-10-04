import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  last_login_at?: string;
  user_type: 'admin' | 'collaborator';
}

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Verify user is an admin
        const { data: adminUser, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!error && adminUser) {
          setUser(adminUser as AdminUser);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First, verify user exists in admin_users table
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !adminUser) {
        console.error('Admin user not found:', fetchError);
        return { success: false, error: 'Credenciais inválidas' };
      }

      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
      
      if (!isValidPassword) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      // Try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // If auth user doesn't exist, create it via edge function
      if (authError && authError.message.includes('Invalid login credentials')) {
        console.log('Auth user not found, syncing with Supabase Auth...');
        
        // Call edge function to create auth user and sync IDs
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-admin-auth', {
          body: { 
            email: adminUser.email,
            password: password,
            admin_user_id: adminUser.id
          }
        });

        if (syncError) {
          console.error('Error syncing auth user:', syncError);
          return { success: false, error: 'Erro ao sincronizar autenticação' };
        }

        // Now try to sign in again
        const { error: retryAuthError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (retryAuthError) {
          console.error('Retry auth error:', retryAuthError);
          return { success: false, error: 'Erro ao autenticar' };
        }

        // Update local admin user with new ID if changed
        if (syncResult.user_id !== adminUser.id) {
          adminUser.id = syncResult.user_id;
        }
      } else if (authError) {
        console.error('Auth error:', authError);
        return { success: false, error: 'Erro ao autenticar' };
      }

      setUser(adminUser as AdminUser);

      // Update last login via edge function
      await supabase.functions.invoke('update-last-login', {
        body: { admin_id: adminUser.id }
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AdminContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}