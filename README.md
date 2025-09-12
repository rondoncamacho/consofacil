Sistema integral de gestión de consorcios, diseñado para simplificar la administración de edificios y la comunicación entre los administradores y los residentes. 

Características
Arquitectura Desacoplada: Backend (Node.js) y Frontend (React) separados y comunicados a través de una API REST.

Autenticación Segura: Sistema de login y gestión de roles (administrador y usuario) implementado con Supabase Auth.

Gestión de Consorcios y Edificios: Funcionalidad para crear y gestionar consorcios y sus edificios asociados.

Paginación Eficiente: Las consultas a la base de datos están optimizadas con paginación para manejar grandes volúmenes de datos (más de 500 consorcios).

Seguridad:

Tokens de sesión gestionados por Supabase.

URLs con caducidad para documentos de expensas (por ejemplo, 1 hora).

Row Level Security (RLS) en la base de datos para un control de acceso estricto.

Notificaciones por Email: Integración con SendGrid para el envío de correos masivos a los residentes.

Sistema de Tickets: Los residentes pueden abrir tickets para reportar problemas, y los administradores pueden gestionar su estado.

Interfaz de Usuario Intuitiva: Un panel de control, un panel de administración y una interfaz de tickets creados con Chakra UI.

Tecnologías Utilizadas
Backend (consofacil-backend)
Node.js & Express: Servidor y framework de desarrollo web.

Supabase: Base de datos relacional (PostgreSQL), autenticación y almacenamiento.

Winston: Librería para el registro de logs.

Helmet & express-rate-limit: Middleware de seguridad para proteger la API.

SendGrid: Servicio de envío de emails transaccionales.

Mocha & Chai: Frameworks para pruebas unitarias.

Docker: Para la contenerización de la aplicación.

GitHub Actions: Para automatizar los flujos de trabajo de CI/CD (integración y despliegue continuos).

Frontend (consofacil-frontend)
React: Biblioteca para la construcción de interfaces de usuario.

Vite: Herramienta para el desarrollo y empaquetado del frontend.

React Router: Para el manejo de la navegación.

Chakra UI: Librería de componentes de diseño.

Vitest: Para pruebas unitarias en el frontend.

Despliegue e Infraestructura
Render: Alojamiento del backend.

Vercel: Alojamiento del frontend.

GitHub: Control de versiones y colaboración.

Instalación y Uso
Prerrequisitos
Node.js (versión 16 o superior)

npm o yarn

Docker

Backend
Clona el repositorio:
git clone https://github.com/rondoncamacho/consofacil.git

Navega al directorio del backend:
cd consofacil/consofacil-backend

Instala las dependencias:
npm install

Crea un archivo .env y configura tus variables de entorno (puedes usar el ejemplo de .env.dev):
cp .env.dev .env

Inicia el servidor en modo desarrollo:
npm run dev

Frontend
Navega al directorio del frontend:
cd ../consofacil-frontend

Instala las dependencias:
npm install

Inicia la aplicación:
npm run dev

Caracteristias: 
Los inquilinos y propietarios verán las tarjetas de "Expensas" y "Novedades".
Los propietarios y administradores verán la tarjeta de "Documentos".
Los conserjes y proveedores solo verán las tarjetas de "Novedades" y "Mis Tickets".
Además un SuperAdmin (root)
