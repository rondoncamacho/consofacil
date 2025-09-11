import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Button, Input, useToast, VStack, Select, Text } from '@chakra-ui/react';

const DocumentoUploader = ({ edificioId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    setCategoria(e.target.value);
  };

  const handleUpload = async () => {
    if (!file || !categoria) {
      toast({
        title: "Por favor, selecciona un archivo y una categoría.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    const filePath = `${edificioId}/${categoria}/${Date.now()}_${file.name}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const publicURL = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath).data.publicUrl;

      const { error: dbError } = await supabase
        .from('documentos')
        .insert({
          nombre: file.name,
          edificio_id: edificioId,
          url: publicURL,
          categoria: categoria,
        });

      if (dbError) throw dbError;

      toast({
        title: "Documento subido con éxito.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onUploadSuccess();
      setFile(null);
      setCategoria('');
    } catch (error) {
      toast({
        title: "Error al subir el documento.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <VStack align="stretch" spacing={2} mb={4}>
      <Text>Selecciona una categoría y un archivo:</Text>
      <Select placeholder="Seleccionar Categoría" onChange={handleCategoryChange}>
        <option value="Reglamentos">Reglamentos</option>
        <option value="Actas y Reuniones">Actas y Reuniones</option>
        <option value="Comprobantes">Comprobantes</option>
        <option value="Planos">Planos</option>
        <option value="Pólizas">Pólizas</option>
        <option value="Buenas Prácticas Consorciales">Buenas Prácticas Consorciales</option>
        <option value="Leyes y Documentos">Leyes y Documentos</option>
      </Select>
      <Input type="file" onChange={handleFileChange} />
      <Button
        onClick={handleUpload}
        isLoading={uploading}
        loadingText="Subiendo..."
        colorScheme="teal"
      >
        Subir Documento
      </Button>
    </VStack>
  );
};

export default DocumentoUploader;