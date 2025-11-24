/**
 * HTML Templates
 * Contains all HTML templates for server-side rendering
 * Templates are functions that accept data and return HTML strings
 */

/**
 * Base HTML layout wrapper
 * @param {Object} options - Layout options
 * @param {string} options.title - Page title
 * @param {string} options.content - Page content HTML
 * @param {string} options.scripts - Optional scripts HTML
 * @returns {string} Complete HTML document
 */
function baseLayout({ title = 'SSO Lab', content, scripts = '' }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 40px;
    }
    h1 {
      color: #2d3748;
      margin-bottom: 20px;
    }
    h3 {
      color: #4a5568;
      margin: 20px 0 10px;
    }
    p {
      color: #718096;
      margin-bottom: 15px;
    }
    pre {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      overflow-x: auto;
      font-size: 13px;
      color: #2d3748;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 25px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .btn-success {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;
    }
    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
    }
    .btn-danger {
      color: #e53e3e;
      background: transparent;
      border: 2px solid #e53e3e;
    }
    .btn-danger:hover {
      background: #e53e3e;
      color: white;
    }
    .result-box {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
      background: #f0fff4;
      border: 1px solid #9ae6b4;
      color: #276749;
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .welcome-center {
      text-align: center;
      padding: 60px 20px;
    }
    .welcome-center h1 {
      font-size: 2.5rem;
      margin-bottom: 30px;
    }
    .user-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${content}
    </div>
  </div>
  ${scripts}
</body>
</html>`;
}

/**
 * Login page template
 * @returns {string} Login page HTML
 */
function loginPage() {
  return baseLayout({
    title: 'SSO Lab - Iniciar Sesion',
    content: `
      <div class="welcome-center">
        <h1>Bienvenido al SSO Lab</h1>
        <p>Sistema de autenticacion centralizada con Keycloak</p>
        <a href="/login" class="btn btn-primary">
          Iniciar Sesion con Keycloak
        </a>
      </div>
    `,
  });
}

/**
 * Dashboard page template for authenticated users
 * @param {Object} userInfo - User information from the identity provider
 * @returns {string} Dashboard page HTML
 */
function dashboardPage(userInfo) {
  const username = userInfo.preferred_username || userInfo.name || 'Usuario';
  const userDataJson = JSON.stringify(userInfo, null, 2);

  return baseLayout({
    title: `SSO Lab - ${username}`,
    content: `
      <h1>Hola, ${escapeHtml(username)}! <span class="user-badge">Autenticado</span></h1>
      <p>Has iniciado sesion correctamente en el sistema.</p>

      <h3>Tus Datos (ID Token)</h3>
      <pre>${escapeHtml(userDataJson)}</pre>

      <hr>

      <h3>Prueba de Seguridad - API Backend</h3>
      <p>Tu token de acceso se usara para llamar a la API protegida en el puerto 4000.</p>

      <button onclick="llamarApi()" class="btn btn-success">
        Invocar API Segura
      </button>

      <div id="resultado-api" class="result-box" style="display: none;"></div>

      <hr>

      <a href="/logout" class="btn btn-danger">Cerrar Sesion</a>
    `,
    scripts: `
      <script>
        async function llamarApi() {
          const resultDiv = document.getElementById('resultado-api');
          resultDiv.style.display = 'block';
          resultDiv.textContent = 'Llamando a la API...';
          resultDiv.style.background = '#ebf8ff';
          resultDiv.style.borderColor = '#90cdf4';
          resultDiv.style.color = '#2b6cb0';

          try {
            const response = await fetch('/api-proxy');
            const data = await response.json();

            if (response.ok) {
              resultDiv.style.background = '#f0fff4';
              resultDiv.style.borderColor = '#9ae6b4';
              resultDiv.style.color = '#276749';
              resultDiv.textContent = JSON.stringify(data, null, 2);
            } else {
              resultDiv.style.background = '#fff5f5';
              resultDiv.style.borderColor = '#feb2b2';
              resultDiv.style.color = '#c53030';
              resultDiv.textContent = 'Error: ' + (data.error || 'Unknown error');
            }
          } catch (error) {
            resultDiv.style.background = '#fff5f5';
            resultDiv.style.borderColor = '#feb2b2';
            resultDiv.style.color = '#c53030';
            resultDiv.textContent = 'Error de conexion: ' + error.message;
          }
        }
      </script>
    `,
  });
}

/**
 * Error page template
 * @param {Object} options - Error options
 * @param {string} options.title - Error title
 * @param {string} options.message - Error message
 * @param {string} options.details - Optional error details
 * @returns {string} Error page HTML
 */
function errorPage({ title = 'Error', message, details = '' }) {
  return baseLayout({
    title: `SSO Lab - ${title}`,
    content: `
      <div class="welcome-center">
        <h1 style="color: #e53e3e;">${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        ${details ? `<pre style="text-align: left; margin-top: 20px;">${escapeHtml(details)}</pre>` : ''}
        <a href="/" class="btn btn-primary" style="margin-top: 20px;">
          Volver al Inicio
        </a>
      </div>
    `,
  });
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return text;
  }

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

export { baseLayout, loginPage, dashboardPage, errorPage, escapeHtml };
