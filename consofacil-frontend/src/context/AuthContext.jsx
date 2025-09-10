import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));

  // La función login ahora acepta directamente los tokens.
  // Esto es más coherente, ya que el componente Login.jsx es el que maneja la autenticación inicial.
  const login = (accessToken, newRefreshToken) => {
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  };

  const refresh = async () => {
    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (error) {
        logout();
      } else {
        setToken(data.session.access_token);
        setRefreshToken(data.session.refresh_token);
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
      }
    }
  };

  useEffect(() => {
    // Supabase.auth.onAuthStateChange es más robusto para manejar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        login(session.access_token, session.refresh_token);
      }
      if (event === 'SIGNED_OUT') {
        logout();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;