// consofacil-frontend/src/components/DocumentosPanel.jsx
import { Box, Heading, Text, VStack, Button, Link } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DocumentosPanel = ({ edificioId }) => {
  const { token } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/documentos/${edificioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al cargar documentos');
        setDocumentos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentos();
  }, [edificioId, token, backendUrl]);

  if (loading) return <Text>Cargando documentos...</Text>;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="sm">
      <Heading size="md" mb={4}>Documentos</Heading>
      <VStack spacing={3} align="stretch">
        {documentos.length ? documentos.map((doc) => (
          <Box key={doc.id} p={3} bg="gray.50" borderRadius="md">
            <Link href={doc.archivo_url} isExternal fontWeight="bold" color="teal.500">{doc.nombre}</Link>
            <Text fontSize="sm" color="gray.500">Subido el: {new Date(doc.fecha_subida).toLocaleDateString()}</Text>
          </Box>
        )) : <Text>No hay documentos disponibles.</Text>}
      </VStack>
    </Box>
  );
};

export default DocumentosPanel;