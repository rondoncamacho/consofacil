import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setToken(session?.access_token ?? null);
        setLoading(false);
      }
    );

    // Limpiar la suscripción
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      throw error;
    }

    // Actualizar el estado del contexto de forma manual tras el login
    setSession(data.session);
    setUser(data.user);
    setToken(data.session.access_token);
    setLoading(false);

    // Devuelve el objeto de usuario y sesión para ser usado en el componente de login
    return { user: data.user, session: data.session };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const value = {
    session,
    token,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};