# Práctica Integral SSO: Keycloak + BFF + API

Este repositorio contiene la implementación del laboratorio de SSO seguro utilizando OpenID Connect (OIDC) con flujo Authorization Code + PKCE.

## 📂 Estructura del Proyecto

- **`/keycloak`**: (No incluido en repo, se descarga aparte). Servidor de Identidad (IdP).
- **`/web-bff`**: Backend for Frontend (Node.js/Express) en puerto `3000`. Maneja la sesión y el canje de tokens.
- **`/api`**: Servidor de Recursos (Node.js/Express) en puerto `4000`. Protegido validando firma JWT (RS256).

---

## 🚀 Guía de Despliegue (Ubuntu/Linux)

### 1. Requisitos Previos

- [cite_start]Java 21 (JDK) [cite: 32]
- [cite_start]Node.js 20 (LTS) [cite: 45]
- Terminal con acceso a puertos 8080, 3000 y 4000.

### 2. Puesta en marcha de Keycloak (Puerto 8080)

1.  Descargar Keycloak (versión 26.x o superior) y descomprimir.
2.  Entrar a la carpeta `bin` y ejecutar en modo desarrollo:
    ```bash
    ./kc.sh start-dev
    ```
3.  Entrar a `http://localhost:8080` y crear usuario admin (si no existe).

#### ⚙️ Configuración Obligatoria de Keycloak

Para que el código funcione, se debe configurar lo siguiente en la consola de administración:

1.  [cite_start]**Crear Realm:** Nombre `demo`[cite: 155].
2.  **Crear Cliente:**
    - **Client ID:** `web-app`
    - **Client Protocol:** `openid-connect`
    - [cite_start]**Access Type:** `Public` (necesario para PKCE sin client secret en front)[cite: 174].
    - **Standard Flow:** Activado.
    - [cite_start]**Valid Redirect URIs:** `http://localhost:3000/callback`[cite: 175].
    - **Web Origins:** `+` (o `http://localhost:3000`).
3.  **Crear Usuario de prueba:**
    - Ir a Users > Add user > Username: `usuario1`.
    - Credentials > Set password > `1234` (Temporary: Off).

---

### 3. Puesta en marcha del Web BFF (Puerto 3000)

Este servicio es la cara visible de la aplicación.

1.  Abrir una **nueva terminal**.
2.  Navegar a la carpeta y preparar entorno:
    ```bash
    cd web-bff
    npm install
    ```
3.  Crear archivo `.env` (si no existe) con este contenido:
    ```env
    PORT=3000
    ISSUER=http://localhost:8080/realms/demo
    CLIENT_ID=web-app
    SESSION_SECRET=secreto_super_seguro_cambiar
    ```
4.  Iniciar servicio:
    ```bash
    node index.js
    ```
    _Debe indicar: `🚀 Web BFF corriendo en http://localhost:3000`_

---

### 4. Puesta en marcha de la API (Puerto 4000)

Este servicio valida los tokens criptográficamente.

1.  Abrir una **tercera terminal**.
2.  Navegar a la carpeta y preparar entorno:
    ```bash
    cd api
    npm install
    ```
3.  Crear archivo `.env` con este contenido:
    ```env
    PORT=4000
    ISSUER=http://localhost:8080/realms/demo
    JWKS_URI=http://localhost:8080/realms/demo/protocol/openid-connect/certs
    ```
4.  Iniciar servicio:
    ```bash
    node index.js
    ```
    _Debe indicar: `🛡️ API Segura corriendo en http://localhost:4000`_

---

## ✅ Pruebas de Funcionamiento

1.  Abrir navegador (preferiblemente Incógnito) en `http://localhost:3000`.
2.  Hacer clic en **"Iniciar Sesión con Keycloak"**.
3.  Loguearse con el usuario creado (`usuario1` / `1234`).
4.  Verificar que se muestran los datos del usuario (JSON).
5.  Hacer clic en el botón azul **"Invocar API Segura"**.
6.  **Resultado esperado:** Mensaje verde `¡ACCESO CONCEDIDO DESDE API 4000!`.

## 🛠️ Tecnologías Usadas

- **Keycloak:** Gestión de identidad (OIDC).
- **PKCE:** Protección contra intercepción de código (RFC 7636).
- **Jose (Lib):** Validación segura de JWT y JWKS.
- **Express-Session:** Gestión de sesión en memoria del servidor.
