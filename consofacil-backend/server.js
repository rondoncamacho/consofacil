import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors());
app.use(bodyParser.json());

// Clientes de Supabase
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // 👉 para validar tokens de usuario
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE // 👉 para operaciones privilegiadas
);

// Middleware de autenticación y autorización
const authenticateAndAuthorize = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

  if (error || !user) {
    return res.status(403).json({ error: "Token inválido o usuario no autorizado" });
  }

  req.user = user;
  next();
};

// Rutas
app.get("/", (req, res) => {
  res.send("🚀 API de Consorcios funcionando");
});

// Ejemplo: insertar usuario (solo backend con service_role)
app.post("/usuarios", authenticateAndAuthorize, async (req, res) => {
  const { email, nombre } = req.body;

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .insert([{ email, nombre }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Usuario creado", data });
});

// Ejemplo: listar notificaciones de un usuario autenticado
app.get("/notificaciones", authenticateAndAuthorize, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("notificaciones")
    .select("*")
    .eq("usuario_id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
