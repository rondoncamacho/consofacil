import { Box, Heading, Text, VStack, Button, Select } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Tickets = () => {
  const { edificio } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/tickets/${edificio}?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar tickets');
        setTickets(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [edificio, token, page]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al actualizar estado');
      setTickets(tickets.map(t => t.id === id ? { ...t, estado: newStatus } : t));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={5} maxW="md" mx="auto" mt={10}>
      <Heading mb={4}>Tickets - {edificio}</Heading>
      <VStack spacing={4} align="stretch">
        {tickets.length ? tickets.map((t) => (
          <Box key={t.id} p={4} borderWidth="1px" borderRadius="md">
            <Text>{t.descripcion}</Text>
            <Text color={t.estado === 'abierto' ? 'red.500' : 'green.500'}>{t.estado}</Text>
            <Button mt={2} size="sm" onClick={() => handleStatusChange(t.id, t.estado === 'abierto' ? 'cerrado' : 'abierto')}>
              {t.estado === 'abierto' ? 'Cerrar' : 'Reabrir'}
            </Button>
          </Box>
        )) : <Text>No hay tickets</Text>}
        <Select mt={2} onChange={(e) => setPage(Number(e.target.value))}>
          {[1, 2, 3].map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Button colorScheme="teal" onClick={() => navigate(`/${edificio}/dashboard`)}>Volver</Button>
      </VStack>
    </Box>
  );
};

export default Tickets;