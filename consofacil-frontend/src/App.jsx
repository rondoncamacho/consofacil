// consofacil-frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/:edificio/dashboard" element={<Dashboard />} />
        <Route path="/:edificio/tickets" element={<Tickets />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;