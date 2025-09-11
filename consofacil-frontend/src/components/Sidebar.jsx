import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaRegFileAlt, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Sidebar = ({ edificioInfo, edificioId }) => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const sidebarBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) return;
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        const { data: userData, error: userError } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
        if (userData && !userError) {
          setIsAdmin(userData.rol === 'admin');
        }
      }
    };
    checkAdmin();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <VStack
      p={5}
      w="250px"
      bg={sidebarBg}
      spacing={5}
      align="stretch"
      borderRight="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Heading size="md" mb={4} textAlign="center">
        ConsoFacil
      </Heading>
      <Box textAlign="center" mb={4}>
        <Text fontSize="md" fontWeight="bold">
          {edificioInfo ? edificioInfo.direccion : ''}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Edificio {edificioId}
        </Text>
      </Box>

      <Button
        variant="ghost"
        leftIcon={<Icon as={FaHome} />}
        onClick={() => navigate(`/${edificioId}/dashboard`)}
      >
        Dashboard
      </Button>
      <Button
        variant="ghost"
        leftIcon={<Icon as={FaTicketAlt} />}
        onClick={() => navigate(`/${edificioId}/tickets`)}
      >
        Tickets
      </Button>
      <Button
        variant="ghost"
        leftIcon={<Icon as={FaRegFileAlt} />}
        onClick={() => navigate(`/${edificioId}/documentos`)}
      >
        Documentos
      </Button>
      {isAdmin && (
        <Button
          variant="ghost"
          leftIcon={<Icon as={FaUserShield} />}
          onClick={() => navigate('/admin')}
        >
          Panel Admin
        </Button>
      )}
      <Button
        variant="ghost"
        leftIcon={<Icon as={FaSignOutAlt} />}
        onClick={handleLogout}
        mt="auto"
      >
        Cerrar Sesión
      </Button>
    </VStack>
  );
};

export default Sidebar;