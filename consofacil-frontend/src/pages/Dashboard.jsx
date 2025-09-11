import { Box, Heading, Text, VStack, Button, Flex, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import DocumentosPanel from '../components/DocumentosPanel'; // Asegúrate de que este archivo exista

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

  const sidebarBg = useColorModeValue("gray.100", "gray.700");
  const mainContentBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: edificioData, error: edificioError } = await supabase
          .from('edificios')
          .select('direccion, consorcio_id')
          .eq('id', edificio)
          .single();

        if (edificioError) throw new Error('No se pudo obtener la información del edificio.');
        setEdificioInfo(edificioData);

        const novedadesResponse = await fetch(`${backendUrl}/api/notificaciones/${edificio}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const novedadesData = await novedadesResponse.json();
        if (!novedadesResponse.ok) throw new Error(novedadesData.error || 'Error al cargar novedades');
        setNovedades(novedadesData);

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

  if (loading) return <Text textAlign="center" mt={20}>Cargando...</Text>;
  if (error) return <Text textAlign="center" mt={20} color="red.500">{error}</Text>;

  return (
    <Flex h="100vh" w="100vw">
      {/* Barra de navegación lateral */}
      <VStack
        p={5}
        w="250px"
        bg={sidebarBg}
        spacing={5}
        align="stretch"
        borderRight="1px"
        borderColor="gray.200"
      >
        <Heading size="md" mb={4}>ConsoFacil</Heading>
        <Text fontSize="sm" color="gray.600">{edificioInfo ? edificioInfo.direccion : ''}</Text>
        <Button 
          variant="solid" 
          colorScheme="teal" 
          onClick={() => navigate(`/${edificio}/dashboard`)}
        >
          Dashboard
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/${edificio}/tickets`)}>Tickets</Button>
        <Button variant="ghost">Documentos</Button>
        <Button variant="ghost">Reservas</Button>
        {isAdmin && <Button variant="ghost" onClick={() => navigate('/admin')}>Panel Admin</Button>}
        <Button variant="ghost" onClick={() => navigate('/logout')}>Cerrar Sesión</Button>
      </VStack>

      {/* Contenido principal */}
      <Box flex="1" p={10} bg={mainContentBg} overflowY="auto">
        <Heading mb={6}>Bienvenido</Heading>
        
        {/* Sección de Novedades */}
        <Box mb={10}>
          <Heading size="lg" mb={4}>Novedades</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {novedades.length ? novedades.map((n) => (
              <Box key={n.id} p={5} borderWidth="1px" borderRadius="md" boxShadow="sm">
                <Text fontWeight="bold">{n.asunto || 'Sin Asunto'}</Text>
                <Text fontSize="sm" color="gray.600">{new Date(n.fecha).toLocaleDateString()}</Text>
                <Text mt={2}>{n.mensaje}</Text>
              </Box>
            )) : <Text>No hay novedades para este edificio.</Text>}
          </SimpleGrid>
        </Box>

        {/* Sección de Documentos */}
        <Box mb={10}>
          <Heading size="lg" mb={4}>Documentos</Heading>
          <DocumentosPanel edificioId={edificio} />
        </Box>

        {/* Sección de Expensas */}
        <Box mb={10}>
          <Heading size="lg" mb={4}>Expensas</Heading>
          <Text>Aquí irá la lógica para mostrar las expensas.</Text>
        </Box>

        {/* Sección de Tickets */}
        <Box mb={10}>
          <Heading size="lg" mb={4}>Mis Tickets</Heading>
          <Text>Aquí irá la lógica para mostrar los tickets del usuario.</Text>
        </Box>

      </Box>
    </Flex>
  );
};

export default Dashboard;