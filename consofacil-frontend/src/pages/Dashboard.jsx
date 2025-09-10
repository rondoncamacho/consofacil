// consofacil-frontend/src/pages/Dashboard.jsx

import { Box, Heading, Text, VStack, Button, Flex, SimpleGrid } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import DocumentosPanel from '../components/DocumentosPanel'; // <-- Nueva importación

const Dashboard = () => {
  const { edificio } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [novedades, setNovedades] = useState([]);
  const [edificioInfo, setEdificioInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener información del edificio desde Supabase
        const { data: edificioData, error: edificioError } = await supabase
          .from('edificios')
          .select('direccion, consorcio_id')
          .eq('id', edificio)
          .single();

        if (edificioError) throw new Error('No se pudo obtener la información del edificio.');
        setEdificioInfo(edificioData);

        // 2. Obtener las novedades (Notificaciones)
        const novedadesResponse = await fetch(`${backendUrl}/api/notificaciones/${edificio}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const novedadesData = await novedadesResponse.json();
        if (!novedadesResponse.ok) throw new Error(novedadesData.error || 'Error al cargar novedades');
        setNovedades(novedadesData);

        // 3. Obtener el rol del usuario (para el Panel Admin)
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
  }, [edificio, token, backendUrl]);

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={5} maxW="container.xl" mx="auto" mt={10}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>{edificioInfo ? `Dashboard - ${edificioInfo.direccion}` : 'Dashboard'}</Heading>
        <VStack>
          <Button colorScheme="teal" onClick={() => navigate(`/${edificio}/tickets`)}>Ver Tickets</Button>
          {isAdmin && <Button colorScheme="blue" onClick={() => navigate('/admin')}>Panel Admin</Button>}
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={10}>
        {/* Sección de Novedades */}
        <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="sm">
          <Heading size="md" mb={4}>Novedades</Heading>
          <VStack spacing={3} align="stretch">
            {novedades.length ? novedades.map((n) => (
              <Box key={n.id} p={3} bg="gray.50" borderRadius="md">
                <Text>{n.mensaje}</Text>
                <Text fontSize="xs" color="gray.500">{new Date(n.fecha).toLocaleDateString()}</Text>
              </Box>
            )) : <Text>No hay novedades para este edificio.</Text>}
          </VStack>
        </Box>

        {/* Sección de Expensas (PENDIENTE) */}
        <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="sm">
          <Heading size="md" mb={4}>Últimas Expensas</Heading>
          <Text>Aquí irá la lista de expensas.</Text>
          <Button mt={4} colorScheme="orange">Ver todas las expensas</Button>
        </Box>

        {/* Sección de Tickets (PENDIENTE) */}
        <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="sm">
          <Heading size="md" mb={4}>Tickets Abiertos</Heading>
          <Text>Aquí irá la lista de tickets abiertos.</Text>
          <Button mt={4} colorScheme="purple">Crear nuevo ticket</Button>
        </Box>

        {/* Nuevo Panel de Documentos */}
        <DocumentosPanel edificioId={edificio} />
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;