import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'collaborator';
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const loadUserData = useCallback(async (authUser: User) => {
    try {
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!roleData) {
        console.error('User has no admin role');
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, last_login_at')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!profileData) {
        console.error('Profile not found');
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        full_name: profileData.full_name,
        role: roleData.role as 'admin' | 'collaborator',
        last_login_at: profileData.last_login_at || undefined
      });

      // Update last login in background (don't await)
      supabase.functions.invoke('update-last-login', {
        body: { admin_id: authUser.id }
      }).catch(err => console.error('Failed to update last login:', err));

    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle pending user data loading (deferred from onAuthStateChange)
  useEffect(() => {
    if (pendingUserId && session?.user && session.user.id === pendingUserId) {
      loadUserData(session.user);
      setPendingUserId(null);
    }
  }, [pendingUserId, session, loadUserData]);

  useEffect(() => {
    // Set up auth state listener FIRST (critical for avoiding deadlocks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Only synchronous state updates here - NO async calls
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        // Defer the async loadUserData call using setTimeout to avoid deadlock
        setTimeout(() => {
          setPendingUserId(newSession.user.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        loadUserData(existingSession.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        setIsLoading(false);
        return { success: false, error: 'Email ou senha inválidos' };
      }

      if (!authData.user) {
        setIsLoading(false);
        return { success: false, error: 'Erro ao autenticar' };
      }

      // loadUserData will be called by the auth state change listener
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
