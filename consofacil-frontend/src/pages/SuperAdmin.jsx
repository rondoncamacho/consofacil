import { Box, Heading, Text, VStack, Button, SimpleGrid, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const SuperAdmin = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermissionsAndFetch = async () => {
      if (!session) {
        navigate('/login');
        return;
      }

      // Paso 1: Obtener el rol del usuario autenticado
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('email', session.user.email)
        .single();

      if (userError || userData.rol !== 'superadmin') {
        navigate('/');
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para ver esta página.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Paso 2: Si es superadmin, obtener todos los edificios
      try {
        const { data: edificiosData, error: edificiosError } = await supabase.from('edificios').select('*');
        if (edificiosError) throw edificiosError;
        setEdificios(edificiosData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkPermissionsAndFetch();
    }
  }, [session, authLoading, navigate, toast]);

  const handleBackup = () => {
    // Lógica para realizar un backup global
    toast({
      title: "Copia de seguridad en progreso",
      description: "Esta función está en desarrollo.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={10}>
      <Heading mb={6}>Panel Super Admin</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {edificios.map(ed => (
          <Box key={ed.id} p={5} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">Edificio: {ed.direccion}</Text>
            <Button mt={2} colorScheme="teal" onClick={() => navigate(`/superadmin/edificio/${ed.id}`)}>
              Gestionar
            </Button>
          </Box>
        ))}
      </SimpleGrid>
      <Button mt={6} colorScheme="red" onClick={handleBackup}>Backup Global</Button>
    </Box>
  );
};

export default SuperAdmin;