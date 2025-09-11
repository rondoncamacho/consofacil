import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

const App = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard/:edificio" 
            element={session ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/" 
            element={session ? <Navigate to="/dashboard/:edificio" replace /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;