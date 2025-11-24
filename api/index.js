import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// --- CORS MANUAL (Para permitir que el puerto 3000 nos hable) ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Solo el BFF puede entrar
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Esto descarga las llaves públicas para verificar que el token es real
const JWKS = createRemoteJWKSet(new URL(process.env.JWKS_URI));

async function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Verificamos que venga el header "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta token de acceso" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Validar firma criptográfica, expiración y emisor
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.ISSUER,
    });

    req.user = payload; // Guardamos datos del usuario
    next(); // Dejamos pasar
  } catch (err) {
    console.error("❌ Token inválido:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// --- RUTAS ---

// Ruta Pública
app.get("/api/publico", (req, res) => {
  res.json({ mensaje: "Hola, soy pública 🌍" });
});

// Ruta Protegida (Aquí es donde apunta el botón azul)
app.get("/api/perfil", validateToken, (req, res) => {
  console.log("✅ Acceso autorizado a:", req.user.preferred_username);
  res.json({
    mensaje: "¡ACCESO CONCEDIDO DESDE API 4000! 🔐",
    usuario: req.user.preferred_username,
    email: req.user.email,
    detalles_token: "Firma verificada correctamente con Keycloak",
  });
});

app.listen(process.env.PORT, () => {
  console.log(
    `🛡️ API Segura corriendo en http://localhost:${process.env.PORT}`
  );
});
