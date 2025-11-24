# Practica Integral SSO: Keycloak + BFF + API

Este repositorio contiene la implementacion del laboratorio de SSO seguro utilizando OpenID Connect (OIDC) con flujo Authorization Code + PKCE.

## Estructura del Proyecto

```
sso-lab/
├── web-bff/                    # Backend for Frontend (Puerto 3000)
│   └── src/
│       ├── config/             # Configuracion centralizada
│       ├── middleware/         # Session, auth, security, logging
│       ├── routes/             # Auth, home, proxy
│       ├── services/           # Keycloak, API client
│       ├── templates/          # HTML templates
│       ├── app.js              # Express app setup
│       └── index.js            # Entry point
├── api/                        # Servidor de Recursos (Puerto 4000)
│   └── src/
│       ├── config/             # Configuracion centralizada
│       ├── middleware/         # CORS, JWT auth, security
│       ├── routes/             # Public, profile endpoints
│       ├── app.js              # Express app setup
│       └── index.js            # Entry point
├── deploy/                     # SystemD service files
└── keycloak/                   # (No incluido, se descarga aparte)
```

---

## Guia de Despliegue (Ubuntu/Linux)

### 1. Requisitos Previos

- Java 21 (JDK)
- Node.js 18+ (LTS)
- Terminal con acceso a puertos 8080, 3000 y 4000.

### 2. Puesta en marcha de Keycloak (Puerto 8080)

1.  Descargar Keycloak (version 26.x o superior) y descomprimir.
2.  Entrar a la carpeta `bin` y ejecutar en modo desarrollo:
    ```bash
    ./kc.sh start-dev
    ```
3.  Entrar a `http://localhost:8080` y crear usuario admin (si no existe).

#### Configuracion Obligatoria de Keycloak

Para que el codigo funcione, se debe configurar lo siguiente en la consola de administracion:

1.  **Crear Realm:** Nombre `demo`.
2.  **Crear Cliente:**
    - **Client ID:** `web-app`
    - **Client Protocol:** `openid-connect`
    - **Access Type:** `Confidential` (con client secret).
    - **Standard Flow:** Activado.
    - **Valid Redirect URIs:** `http://localhost:3000/callback`.
    - **Web Origins:** `+` (o `http://localhost:3000`).
3.  **Crear Usuario de prueba:**
    - Ir a Users > Add user > Username: `usuario1`.
    - Credentials > Set password > `1234` (Temporary: Off).

---

### 3. Puesta en marcha del Web BFF (Puerto 3000)

Este servicio es la cara visible de la aplicacion.

1.  Abrir una **nueva terminal**.
2.  Navegar a la carpeta y preparar entorno:
    ```bash
    cd web-bff
    npm install
    ```
3.  Crear archivo `.env` copiando el ejemplo:
    ```bash
    cp .env.example .env
    ```
4.  Editar `.env` con tus valores:
    ```env
    PORT=3000
    NODE_ENV=development
    SESSION_SECRET=secreto_super_seguro_cambiar
    ISSUER=http://localhost:8080/realms/demo
    CLIENT_ID=web-app
    CLIENT_SECRET=tu-client-secret
    ```
5.  Iniciar servicio:
    ```bash
    # Desarrollo (con auto-reload)
    npm run dev

    # Produccion
    npm start
    ```
    _Debe indicar: `[Server] Web BFF running on http://localhost:3000`_

---

### 4. Puesta en marcha de la API (Puerto 4000)

Este servicio valida los tokens criptograficamente.

1.  Abrir una **tercera terminal**.
2.  Navegar a la carpeta y preparar entorno:
    ```bash
    cd api
    npm install
    ```
3.  Crear archivo `.env` copiando el ejemplo:
    ```bash
    cp .env.example .env
    ```
4.  Editar `.env` con tus valores:
    ```env
    PORT=4000
    NODE_ENV=development
    ISSUER=http://localhost:8080/realms/demo
    JWKS_URI=http://localhost:8080/realms/demo/protocol/openid-connect/certs
    ```
5.  Iniciar servicio:
    ```bash
    # Desarrollo (con auto-reload)
    npm run dev

    # Produccion
    npm start
    ```
    _Debe indicar: `[Server] API running on http://localhost:4000`_

---

## Pruebas de Funcionamiento

1.  Abrir navegador (preferiblemente Incognito) en `http://localhost:3000`.
2.  Hacer clic en **"Iniciar Sesion con Keycloak"**.
3.  Loguearse con el usuario creado (`usuario1` / `1234`).
4.  Verificar que se muestran los datos del usuario (JSON).
5.  Hacer clic en el boton **"Invocar API Segura"**.
6.  **Resultado esperado:** Mensaje verde `ACCESO CONCEDIDO - API Protegida`.

## Endpoints Disponibles

### Web BFF (Puerto 3000)
| Endpoint | Descripcion |
|----------|-------------|
| `GET /` | Pagina principal (login o dashboard) |
| `GET /login` | Inicia flujo OIDC con PKCE |
| `GET /callback` | Callback de autenticacion |
| `GET /logout` | Cierra sesion |
| `GET /api-proxy` | Proxy autenticado hacia la API |
| `GET /health` | Health check |

### API (Puerto 4000)
| Endpoint | Auth | Descripcion |
|----------|------|-------------|
| `GET /api/publico` | No | Endpoint publico |
| `GET /api/perfil` | Si | Perfil del usuario autenticado |
| `GET /api/perfil/detalle` | Si | Informacion detallada del token |
| `GET /api/health` | No | Health check |

## Tecnologias Usadas

- **Keycloak:** Gestion de identidad (OIDC).
- **PKCE:** Proteccion contra intercepcion de codigo (RFC 7636).
- **Jose (Lib):** Validacion segura de JWT y JWKS.
- **Express-Session:** Gestion de sesion en memoria del servidor.
- **Express 5:** Framework HTTP con soporte nativo para async/await.
