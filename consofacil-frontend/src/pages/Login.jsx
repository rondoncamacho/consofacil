// consofacil-frontend/src/pages/Login.jsx

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Center, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await login(email, password);
      const { data: userData, error: userError } = await supabase.from('usuarios').select('edificio_id').eq('id', user.id).single();
      if (userError) throw userError;

      if (userData.edificio_id) {
        navigate(`/${userData.edificio_id}/dashboard`);
      } else {
        throw new Error('No se obtuvo edificio_id');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh" bg="gray.50">
      <Box p={6} bg="white" borderRadius="lg" boxShadow="xl" maxW="md" w="full">
        <VStack spacing={4} as="form" onSubmit={handleLogin}>
          <Image src="/logo.png" alt="ConsoFacil Logo" boxSize="100px" objectFit="contain" />
          <Text fontSize="2xl" fontWeight="bold">ConsoFacil - Acceso</Text>
          <Text fontSize="sm" color="gray.600">Gestión de consorcios</Text>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              bg="gray.100"
              border="none"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              bg="gray.100"
              border="none"
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit" colorScheme="teal" width="full" mt={4} isLoading={loading}>
            Iniciar Sesión
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};

export default Login;