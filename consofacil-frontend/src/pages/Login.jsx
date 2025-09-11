import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useColorModeValue,
  Center,
  Heading,
  InputGroup,
  InputLeftElement,
  Icon,
  Flex,
  Image,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaEnvelope } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await login(email, password);

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('edificio_id, rol')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      if (userData.edificio_id) {
        navigate(`/${userData.edificio_id}/dashboard`);
      } else {
        throw new Error('No se obtuvo edificio_id');
      }
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Box
        p={{ base: 6, md: 12 }}
        maxWidth="450px"
        width="100%"
        borderWidth="1px"
        borderRadius="xl"
        boxShadow="xl"
        bg={useColorModeValue('white', 'gray.800')}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <VStack spacing={6} as="form" onSubmit={handleLogin} align="stretch">
          <Center mb={4}>
            <Image
              src="/path/to/your/logo.png" // ⚠️ Cambia esta ruta por la de tu logo
              alt="Logo ConsoFacil"
              h="50px"
            />
          </Center>

          <Heading as="h1" size="xl" textAlign="center">
            Bienvenido
          </Heading>
          <Text
            fontSize="md"
            textAlign="center"
            color={useColorModeValue('gray.600', 'gray.400')}
          >
            Inicia sesión para acceder a tu cuenta
          </Text>

          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaEnvelope} color="gray.400" />
              </InputLeftElement>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuemail@ejemplo.com"
                focusBorderColor="teal.500"
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="password">Contraseña</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaLock} color="gray.400" />
              </InputLeftElement>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                focusBorderColor="teal.500"
              />
            </InputGroup>
          </FormControl>

          {error && (
            <Box
              p={3}
              bg="red.50"
              color="red.600"
              borderRadius="md"
              textAlign="center"
            >
              <Text>{error}</Text>
            </Box>
          )}

          <Button
            type="submit"
            colorScheme="teal"
            width="full"
            isLoading={loading}
            loadingText="Iniciando sesión..."
            mt={4}
            size="lg"
          >
            Iniciar Sesión
          </Button>

          <Flex justifyContent="space-between" fontSize="sm" mt={2}>
            <Text
              as="a"
              color="teal.500"
              href="#"
              onClick={() => {}}
              _hover={{ textDecoration: 'underline' }}
            >
              ¿Olvidaste tu contraseña?
            </Text>
            <Text
              as="a"
              color="teal.500"
              href="#"
              onClick={() => {}}
              _hover={{ textDecoration: 'underline' }}
            >
              Regístrate
            </Text>
          </Flex>
        </VStack>
      </Box>
    </Center>
  );
};

export default Login;