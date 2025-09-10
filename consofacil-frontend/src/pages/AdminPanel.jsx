import { Box, Heading, Text, VStack, Button, Select } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [consorcios, setConsorcios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchConsorcios = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/consorcios?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar consorcios');
        setConsorcios(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConsorcios();
  }, [token, page, backendUrl]);

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={5} maxW="md" mx="auto" mt={10}>
      <Heading mb={4}>Panel Admin</Heading>
      <VStack spacing={4} align="stretch">
        {consorcios.map(c => (
          <Box key={c.id} p={4} borderWidth="1px" borderRadius="md">
            <Text>{c.nombre}</Text>
            {c.edificios.map(e => (
              <Text key={e.id} ml={4}>Edificio: {e.direccion} (Unidades: {e.unidades})</Text>
            ))}
          </Box>
        ))}
        <Select mt={2} onChange={(e) => setPage(Number(e.target.value))}>
          {[1, 2, 3].map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Button colorScheme="teal" onClick={() => navigate('/admin/create-consorcio')}>Crear Consorcio</Button>
      </VStack>
    </Box>
  );
};

export default AdminPanel;