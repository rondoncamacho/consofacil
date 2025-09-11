import { Box, Heading, Icon, Text, useColorModeValue } from '@chakra-ui/react';

export const Card = ({ title, icon, content }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      bg={cardBg}
      borderRadius="lg"
      boxShadow="lg"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.3s ease-in-out"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
    >
      <Box mb={4} display="flex" alignItems="center">
        {icon && <Icon as={icon} w={6} h={6} color="teal.500" mr={3} />}
        <Heading size="md">{title}</Heading>
      </Box>
      <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
        {content}
      </Text>
    </Box>
  );
};