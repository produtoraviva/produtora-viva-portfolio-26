import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  last_login_at?: string;
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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Verify this is an admin user
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (adminUser) {
          setUser(adminUser);
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
      
      // Get admin user from database with simpler query
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (!adminUser) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      // Verify password
      console.log('Comparing password for user:', adminUser.email);
      const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      // Sign in with Supabase Auth using admin ID as user ID
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `admin-${adminUser.id}@internal.com`, // Use internal email format
        password: adminUser.id, // Use ID as password for Supabase auth
      });

      if (signInError) {
        // If sign in fails, create the auth user first
        const { error: signUpError } = await supabase.auth.signUp({
          email: `admin-${adminUser.id}@internal.com`,
          password: adminUser.id,
        });

        if (signUpError) {
          return { success: false, error: 'Erro de autenticação' };
        }

        // Try signing in again
        const { error: retrySignInError } = await supabase.auth.signInWithPassword({
          email: `admin-${adminUser.id}@internal.com`,
          password: adminUser.id,
        });

        if (retrySignInError) {
          return { success: false, error: 'Erro de autenticação' };
        }
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', adminUser.id);

      setUser(adminUser);
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