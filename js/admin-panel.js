const VALID_USERNAME = 'admin'; // Usuario permitido
const PASSWORD_HASH = '5ef32fa9021000f6d67c8e5c7c827340368f5792f71b48b9cdea128e2f687de3'; // SHA-256 de la contraseña

const token = 'nfp_9mSuHfuSENEKLBWqGfeNu8BYX3ADo1o38f17';
const siteId = '2b561310-c301-42be-9af0-bed54bb1f37e';

// Función de login
async function verificarCredenciales() {
  const inputUsername = document.getElementById('username')?.value || '';
  const inputPassword = document.getElementById('password').value;
  const hash = await sha256(inputPassword);

  if (inputUsername === VALID_USERNAME && hash === PASSWORD_HASH) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('panel').style.display = 'block';
    obtenerEnvios();
  } else {
    document.getElementById('error-msg').innerText = 'Usuario o contraseña incorrectos';
  }
}

// Función de hashing SHA-256
async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Obtener envíos del formulario desde Netlify
async function obtenerEnvios() {
  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/submissions?include=form_data`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const datos = await res.json();
    const tbody = document.getElementById('form-entries');
    tbody.innerHTML = '';

    if (!Array.isArray(datos) || datos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay envíos</td></tr>';
      return;
    }

    datos.forEach(item => {
      const fecha = new Date(item.created_at).toLocaleString();
      const nombre = item.data['contact-name'] || '-';
      const email = item.data['contact-email'] || '-';
      const mensaje = item.data['contact-message'] || '-';

      let archivo = '-';
      if (item.data.archivo && item.data.archivo.url) {
        const archivoUrl = item.data.archivo.url;
        archivo = `<a href="${archivoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-success">Ver archivo</a>`;
      }

      tbody.innerHTML += `
        <tr>
          <td>${fecha}</td>
          <td>${nombre}</td>
          <td>${email}</td>
          <td>${mensaje}</td>
          <td>${archivo}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error('Error al obtener envíos:', error);
    const tbody = document.getElementById('form-entries');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos</td></tr>';
  }
}