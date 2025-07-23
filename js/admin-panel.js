const PASSWORD_HASH = '5ef32fa9021000f6d67c8e5c7c827340368f5792f71b48b9cdea128e2f687de3'; // tu SHA-256
const token = 'nfp_9mSuHfuSENEKLBWqGfeNu8BYX3ADo1o38f17';
const siteId = '2b561310-c301-42be-9af0-bed54bb1f37e';

async function verificarPassword() {
  const input = document.getElementById('password').value;
  const hash = await sha256(input);

  if (hash === PASSWORD_HASH) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('panel').style.display = 'block';
    obtenerEnvios();
  } else {
    document.getElementById('error-msg').innerText = 'Contraseña incorrecta';
  }
}

async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function obtenerEnvios() {
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
}