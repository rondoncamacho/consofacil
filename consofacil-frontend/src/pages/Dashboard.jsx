import { Box, Heading, Text, VStack, Flex, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { Card } from '../components/Card';
import DocumentosPanel from '../components/DocumentosPanel';
import { FaBell, FaFileInvoiceDollar, FaRegFileAlt, FaTicketAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { edificio } = useParams();
  const { token } = useAuth();
  const [novedades, setNovedades] = useState([]);
  const [edificioInfo, setEdificioInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const mainContentBg = useColorModeValue("gray.50", "gray.900");

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
      <Sidebar edificioInfo={edificioInfo} edificioId={edificio} />

      <Box flex="1" p={10} bg={mainContentBg} overflowY="auto">
        <Heading mb={6}>Panel de Control</Heading>
        
        <VStack spacing={8} align="stretch">
          <Card 
            title="Novedades Recientes" 
            icon={FaBell} 
            content={novedades.length > 0 ? (
              novedades.slice(0, 3).map(novedad => (
                <Box key={novedad.id} p={2} borderBottom="1px" borderColor="gray.200">
                  <Text fontWeight="bold">{novedad.asunto}</Text>
                  <Text fontSize="sm" color="gray.500">{new Date(novedad.fecha).toLocaleDateString()}</Text>
                </Box>
              ))
            ) : (
              <Text>No hay novedades para este edificio.</Text>
            )} 
          />
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            <Card
              title="Expensas"
              icon={FaFileInvoiceDollar}
              content="Aquí se mostrarán las expensas."
            />
            <Card
              title="Documentos"
              icon={FaRegFileAlt}
              content={<DocumentosPanel edificioId={edificio} />}
            />
            <Card
              title="Mis Tickets"
              icon={FaTicketAlt}
              content="Aquí se mostrarán los tickets del usuario."
            />
          </SimpleGrid>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Dashboard;