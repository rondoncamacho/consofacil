import { Box, Heading, Text, VStack, Button, Select } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { edificio } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(1);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      console.log('Token que se va a enviar:', token); 

      try {
        const response = await fetch(`${backendUrl}/api/notificaciones/${edificio}?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar novedades');
        
        setNovedades(data);
        
        const userResponse = await fetch(`${backendUrl}/api/auth/user-role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        setIsAdmin(userData.rol === 'admin');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [edificio, token, page, backendUrl]);

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={5} maxW="md" mx="auto" mt={10}>
      <Heading mb={4}>Dashboard - {edificio}</Heading>
      <VStack spacing={4} align="stretch">
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold">Novedades</Text>
          {novedades.length ? novedades.map((n, i) => <Text key={i}>{n.mensaje}</Text>) : <Text>No hay novedades</Text>}
          <Select mt={2} onChange={(e) => setPage(Number(e.target.value))}>
            {[1, 2, 3].map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Box>
        <Button colorScheme="teal" onClick={() => navigate(`/${edificio}/tickets`)}>Ver Tickets</Button>
        {isAdmin && <Button colorScheme="blue" onClick={() => navigate('/admin')}>Panel Admin</Button>}
      </VStack>
    </Box>
  );
};

export default Dashboard;