import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any, isStaff: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isStaff: boolean;
  userRole: string | null;
}

const AUTH_CACHE_KEY = 'satome_auth_cache';

const getAuthCache = () => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch { }
  return null;
};

const setAuthCache = (isStaff: boolean, role: string | null) => {
  try {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ isStaff, role }));
  } catch { }
};

const clearAuthCache = () => {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
  } catch { }
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null, isStaff: false }),
  signUp: async () => ({ error: null }),
  signOut: async () => { },
  isStaff: false,
  userRole: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Restore cached role instantly to avoid loading spinner on repeat visits
  const cached = getAuthCache();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(cached?.isStaff ?? false);
  const [userRole, setUserRole] = useState<string | null>(cached?.role ?? null);
  const isSigningOut = useRef(false);
  const isSigningIn = useRef(false);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setIsStaff(true);
        setUserRole(data.role);
        setAuthCache(true, data.role);
        return { isStaff: true, role: data.role };
      } else {
        setIsStaff(false);
        setUserRole(null);
        clearAuthCache();
        return { isStaff: false, role: null };
      }
    } catch {
      setIsStaff(false);
      setUserRole(null);
      clearAuthCache();
      return { isStaff: false, role: null };
    }
  }, []);

  useEffect(() => {
    // 1. Check for an existing session on mount (handles page refresh)
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        // If we have cached role data, show content immediately
        // and refresh role in the background
        if (cached?.isStaff) {
          setLoading(false);
          // Refresh role in background (non-blocking)
          fetchRole(existingSession.user.id);
        } else {
          // No cache — must wait for role before rendering
          await fetchRole(existingSession.user.id);
          setLoading(false);
        }
      } else {
        // No session — clear cache and stop loading
        clearAuthCache();
        setIsStaff(false);
        setUserRole(null);
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes (token refresh, sign out from another tab, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // If we triggered sign-out, clear everything
        if (isSigningOut.current) {
          setSession(null);
          setUser(null);
          setIsStaff(false);
          setUserRole(null);
          clearAuthCache();
          setLoading(false);
          return;
        }

        // If signIn() is currently running, it manages all state itself.
        if (isSigningIn.current) {
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          // Session refreshed in the background — update session silently
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            fetchRole(currentSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsStaff(false);
          setUserRole(null);
          clearAuthCache();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signIn = async (email: string, password: string) => {
    isSigningOut.current = false;
    isSigningIn.current = true;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      let staffResult = false;

      if (data?.user && !error) {
        setSession(data.session);
        setUser(data.user);

        const roleResult = await fetchRole(data.user.id);
        staffResult = roleResult.isStaff;
      }

      setLoading(false);
      return { error, isStaff: staffResult };
    } catch (err: any) {
      setLoading(false);
      return { error: err, isStaff: false };
    } finally {
      isSigningIn.current = false;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/admin`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = useCallback(async () => {
    isSigningOut.current = true;
    clearAuthCache();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsStaff(false);
    setUserRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        isStaff,
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
