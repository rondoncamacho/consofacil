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
  Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaEnvelope } from 'react-icons/fa'; // Importa iconos de React

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
      // login devuelve { user, session }
      const { user, session } = await login(email, password);

      if (!session?.access_token) {
        throw new Error('No se obtuvo un token de sesión');
      }

      // Llamar al backend para obtener el edificio_id y rol
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user-role`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        throw new Error('Error obteniendo datos del usuario');
      }

      const userData = await res.json();

      if (userData.edificio_id) {
        navigate(`/${userData.edificio_id}/dashboard`);
      } else {
        throw new Error('No se obtuvo edificio_id');
      }
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Center minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        p={8}
        maxWidth="450px"
        width="100%"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="xl"
        bg={formBgColor}
        borderColor={borderColor}
      >
        <VStack spacing={6} as="form" onSubmit={handleLogin} align="stretch">
          <Heading
            as="h1"
            size="xl"
            textAlign="center"
            bgGradient="linear(to-l, teal.500, blue.500)"
            bgClip="text"
          >
            ConsoFacil
          </Heading>
          <Text
            fontSize="lg"
            textAlign="center"
            color={useColorModeValue('gray.600', 'gray.400')}
          >
            Inicia sesión en tu cuenta
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
            boxShadow="md"
            _hover={{ boxShadow: 'lg' }}
          >
            Iniciar Sesión
          </Button>

          <Flex justifyContent="space-between" fontSize="sm" mt={2}>
            <Text>
              ¿Olvidaste tu contraseña?{' '}
              <Text as="a" color="teal.500" href="#">
                Recuperar
              </Text>
            </Text>
            <Text>
              ¿No tienes cuenta?{' '}
              <Text as="a" color="teal.500" href="#">
                Regístrate
              </Text>
            </Text>
          </Flex>
        </VStack>
      </Box>
    </Center>
  );
};

export default Login;
