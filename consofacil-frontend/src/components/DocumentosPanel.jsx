import { Box, Heading, Text, SimpleGrid, Button, Link, Icon, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaFolder } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const DocumentosPanel = ({ edificioId, userRole }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  
  const groupedDocs = documentos.reduce((acc, doc) => {
    (acc[doc.categoria] = acc[doc.categoria] || []).push(doc);
    return acc;
  }, {});

  const fetchDocumentos = async () => {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('edificio_id', edificioId);
      if (error) throw error;
      setDocumentos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [edificioId]);

  if (loading) return <Text>Cargando documentos...</Text>;
  if (error) return <Text color="red.500">{error.message}</Text>;

  if (selectedCategoria) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="sm">
        <Button onClick={() => setSelectedCategoria(null)} mb={4}>Volver a Categorías</Button>
        <Heading size="md" mb={4}>{selectedCategoria}</Heading>
        {groupedDocs[selectedCategoria]?.length > 0 ? (
          groupedDocs[selectedCategoria].map((doc) => (
            <Box key={doc.id} p={3} bg="gray.50" borderRadius="md" my={2}>
              <Link href={doc.url} isExternal fontWeight="bold" color="teal.500">{doc.nombre}</Link>
            </Box>
          ))
        ) : (
          <Text>No hay documentos en esta categoría.</Text>
        )}
      </Box>
    );
  }

  const categorias = Object.keys(groupedDocs);
  const showUploader = userRole === 'admin' || userRole === 'conserje';

  return (
    <VStack align="stretch" spacing={4}>
      {showUploader && (
        <Box>
          <DocumentoUploader 
            edificioId={edificioId} 
            onUploadSuccess={fetchDocumentos} 
          />
        </Box>
      )}
      <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={4}>Documentos</Heading>
        {categorias.length > 0 ? (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
            {categorias.map(categoria => (
              <Box
                key={categoria}
                p={4}
                textAlign="center"
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                onClick={() => setSelectedCategoria(categoria)}
              >
                <Icon as={FaFolder} w={12} h={12} color="teal.500" />
                <Text mt={2} fontWeight="bold">{categoria}</Text>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text>No hay documentos disponibles.</Text>
        )}
      </Box>
    </VStack>
  );
};

export default DocumentosPanel;