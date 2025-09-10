import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // Importa la función 'login' del AuthContext

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Inicia sesión con Supabase.
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // 2. Llama a la función 'login' del contexto para guardar los tokens.
      login(data.session.access_token, data.session.refresh_token);

      // 3. Obtiene el 'edificio_id' para la redirección.
      const { data: userData, error: userError } = await supabase.from('usuarios').select('edificio_id').eq('id', data.user.id).single();
      if (userError) throw userError;

      // 4. Redirige al dashboard.
      if (userData.edificio_id) {
        navigate(`/${userData.edificio_id}/dashboard`);
      } else {
        throw new Error('No se obtuvo edificio_id');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box p={5} maxW="md" mx="auto" mt={10}>
      <VStack spacing={4} as="form" onSubmit={handleLogin}>
        <Text fontSize="2xl" fontWeight="bold">ConsoFacil - Login</Text>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tuemail@example.com" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Contraseña</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </FormControl>
        {error && <Text color="red.500">{error}</Text>}
        <Button type="submit" colorScheme="teal" width="full">Iniciar Sesión</Button>
      </VStack>
    </Box>
  );
};

export default Login;