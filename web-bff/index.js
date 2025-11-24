import express from "express";
import session from "express-session"; // <--- CAMBIO AQUÍ
import { Issuer, generators } from "openid-client";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configurar sesión en MEMORIA (Server-side)
// Esto soluciona el problema de que el token sea muy grande para la cookie
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // false porque estamos en http (localhost)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Middleware chismoso (opcional, para ver si funciona)
app.use((req, res, next) => {
  console.log(
    `📡 Ruta: ${req.path} | ¿Sesión activa?: ${!!req.session.tokenSet}`
  );
  next();
});

let client;

async function init() {
  const keycloakIssuer = await Issuer.discover(process.env.ISSUER);
  console.log("✅ Keycloak descubierto:", keycloakIssuer.issuer);

  client = new keycloakIssuer.Client({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: ["http://localhost:3000/callback"],
    response_types: ["code"],
  });

  // --- RUTAS ---

  app.get("/", (req, res) => {
    if (req.session.tokenSet) {
      // Si hay sesión, mostramos datos y botón para probar API
      res.send(`
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>¡Hola, ${
                      req.session.userInfo.preferred_username
                    }! 👋</h1>
                    <p>Has iniciado sesión correctamente.</p>
                    
                    <h3>Tus Datos (ID Token decodificado):</h3>
                    <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${JSON.stringify(
                      req.session.userInfo,
                      null,
                      2
                    )}</pre>
                    
                    <hr>
                    
                    <h3>Prueba de Seguridad (API Back-end)</h3>
                    <p>Tu Token de Acceso (Access Token) se usará para llamar al puerto 4000.</p>
                    <button onclick="llamarApi()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 5px;">
                        🔐 Invocar API Segura
                    </button>
                    <div id="resultado-api" style="margin-top: 20px; font-weight: bold; color: green;"></div>

                    <br><br>
                    <a href="/logout" style="color: red;">Cerrar Sesión</a>

                    <script>
                        async function llamarApi() {
                            const div = document.getElementById('resultado-api');
                            div.innerText = "Llamando a la API...";
                            
                            // Pedimos a nuestro propio servidor (BFF) que haga de puente
                            const res = await fetch('/api-proxy');
                            const data = await res.json();
                            div.innerText = JSON.stringify(data, null, 2);
                        }
                    </script>
                </div>
            `);
    } else {
      res.send(`
                <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                    <h1>Bienvenido al Lab SSO 🛡️</h1>
                    <a href="/login" style="background: #4CAF50; color: white; padding: 15px 32px; text-decoration: none; font-size: 16px; border-radius: 5px;">
                        Iniciar Sesión con Keycloak
                    </a>
                </div>
            `);
    }
  });

  app.get("/login", (req, res) => {
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    req.session.code_verifier = code_verifier;
    // Forzamos guardar sesión antes de redirigir
    req.session.save(() => {
      const authUrl = client.authorizationUrl({
        scope: "openid profile email",
        code_challenge,
        code_challenge_method: "S256",
      });
      res.redirect(authUrl);
    });
  });

  app.get("/callback", async (req, res) => {
    const params = client.callbackParams(req);
    const code_verifier = req.session.code_verifier;

    console.log(
      "🔍 Verificando callback... Verifier en sesión:",
      !!code_verifier
    );

    if (!code_verifier) {
      return res
        .status(400)
        .send(
          "Error: Se perdió la sesión (code_verifier) antes de volver de Keycloak."
        );
    }

    try {
      const tokenSet = await client.callback(
        "http://localhost:3000/callback",
        params,
        { code_verifier }
      );
      const userInfo = await client.userinfo(tokenSet.access_token);

      req.session.tokenSet = tokenSet;
      req.session.userInfo = userInfo;
      delete req.session.code_verifier; // Limpieza

      // Forzar guardado antes de ir al Home
      req.session.save(() => {
        res.redirect("/");
      });
    } catch (err) {
      console.error("Callback error:", err);
      res.redirect("/");
    }
  });

  // Nuevo: Proxy para llamar a la API (El BFF agrega el token)
  app.get("/api-proxy", async (req, res) => {
    if (!req.session.tokenSet)
      return res.status(401).json({ error: "No logueado" });

    try {
      const apiRes = await fetch("http://localhost:4000/api/perfil", {
        headers: {
          Authorization: `Bearer ${req.session.tokenSet.access_token}`,
        },
      });
      const data = await apiRes.json();
      res.json(data);
    } catch (e) {
      res.json({ error: "Error conectando con API 4000" });
    }
  });

  app.get("/logout", (req, res) => {
    const id_token = req.session.tokenSet
      ? req.session.tokenSet.id_token
      : undefined;
    req.session.destroy();

    if (id_token) {
      const logoutUrl = client.endSessionUrl({
        id_token_hint: id_token,
        post_logout_redirect_uri: "http://localhost:3000",
      });
      res.redirect(logoutUrl);
    } else {
      res.redirect("/");
    }
  });

  app.listen(process.env.PORT, () => {
    console.log(`🚀 Web BFF corriendo en http://localhost:${process.env.PORT}`);
  });
}

init().catch((err) => console.error(err));
