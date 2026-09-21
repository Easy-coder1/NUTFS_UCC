import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminChecking, setAdminChecking] = useState(false);

  const checkAdminStatus = async (currentUser) => {
    if (!currentUser?.email) {
      setIsAdmin(false);
      return false;
    }

    setAdminChecking(true);
    try {
      // 1. Check custom claims / metadata
      if (
        currentUser.app_metadata?.role === 'admin' ||
        currentUser.user_metadata?.role === 'admin' ||
        currentUser.user_metadata?.is_admin === true
      ) {
        setIsAdmin(true);
        return true;
      }

      // 2. Check public.admin_users table (if table exists)
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', currentUser.email)
        .maybeSingle();

      if (!error && data?.email) {
        setIsAdmin(true);
        return true;
      }

      setIsAdmin(false);
      return false;
    } catch (err) {
      console.warn('Admin check notice:', err.message);
      setIsAdmin(false);
      return false;
    } finally {
      setAdminChecking(false);
    }
  };

  useEffect(() => {
    // Check active session on mount
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await checkAdminStatus(currentUser);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await checkAdminStatus(currentUser);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data?.user) {
      await checkAdminStatus(data.user);
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsAdmin(false);
  };

  const refreshAdminStatus = () => checkAdminStatus(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminChecking,
        loading,
        signIn,
        signOut,
        refreshAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
