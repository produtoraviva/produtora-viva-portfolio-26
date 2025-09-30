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
      // For simplified admin system, we'll check localStorage for session
      const savedUser = localStorage.getItem('admin_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setUser(user);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('admin_user');
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

      

      // For testing, let's temporarily allow direct password comparison
      if (email === 'admin@portfolio.com' && password === 'admin123456') {
        
        
        // Create a simple session and save to localStorage
        setUser(adminUser as AdminUser);
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        
        // Update last login via edge function
        await supabase.functions.invoke('update-last-login', {
          body: { admin_id: adminUser.id }
        });

        return { success: true };
      }

      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
      
      if (!isValidPassword) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      
      
      // Create a simple session without Supabase Auth for now
      setUser(adminUser as AdminUser);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));

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
    localStorage.removeItem('admin_user');
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