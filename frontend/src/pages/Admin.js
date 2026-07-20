import { AuthUtils } from '../utils/auth.js';
import { AIService } from '../services/aiService.js';
import { fetchApi } from '../services/api.js';

export const Admin = () => {
  const user = AuthUtils.getUser();
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!user) {
    return document.createTextNode('Usuario no encontrado.');
  }

  // --- HTML de Configuración de API Key ---
  const apiKeyHTML = `
    <div class="card mt-6">
      <h3 class="flex items-center gap-2 mb-4" style="color: var(--color-primary-dark);">
        <i class="ph ph-key text-primary"></i> Configuración de IA (Gemini)
      </h3>
      <p class="text-sm text-muted mb-4">Ingresa tu API Key de Gemini para que el Tutor IA y el generador funcionen correctamente. Obtén una gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--color-primary);">Google AI Studio</a>.</p>
      
      <form id="apikey-form" class="flex gap-4">
        <input type="password" id="apikey-input" class="form-input" style="flex: 1;" placeholder="${user.gemini_api_key ? '********' + user.gemini_api_key.slice(-4) : 'Pega tu API Key de Gemini aquí...'}" required />
        <button type="submit" id="apikey-btn" class="btn btn-primary">
          <i class="ph ph-floppy-disk"></i> Guardar
        </button>
      </form>
      <div id="apikey-result" style="margin-top: var(--spacing-2); font-size: 0.85rem; display: none;"></div>
    </div>
  `;

  if (user.rol === 'CODER') {
    // VISTA DE PERFIL PARA CODER
    const fecha = new Date(user.fecha_registro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    container.innerHTML = `
      <header class="mb-8">
        <h1 style="color: var(--color-text); margin-bottom: var(--spacing-1);">Mi Perfil</h1>
        <p class="text-muted" style="margin: 0;">Información de tu cuenta</p>
      </header>

      <div class="card" style="max-width: 600px; display: flex; align-items: center; gap: var(--spacing-6);">
        <div class="avatar" style="width: 100px; height: 100px; border-radius: 50%; background: var(--color-primary-alpha); flex-shrink: 0; overflow: hidden;">
          <img src="https://ui-avatars.com/api/?name=${user.nombre}&background=random&size=100" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1;">
          <h2 style="margin: 0 0 4px 0;">${user.nombre}</h2>
          <p class="text-muted" style="margin: 0 0 16px 0;">${user.email}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-4);">
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Rol</div>
              <div style="font-weight: 500;">Estudiante (Coder)</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Edad</div>
              <div style="font-weight: 500;">${user.edad || 'No especificada'} años</div>
            </div>
            <div style="grid-column: span 2;">
              <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Miembro desde</div>
              <div style="font-weight: 500;">${fecha}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="max-width: 600px;">
        ${apiKeyHTML}
      </div>
    `;
  } else {
    // VISTA DE ADMIN PARA TEAM_LEADER
    container.innerHTML = `
      <header class="mb-8 flex justify-between items-end">
        <div>
          <h1 style="color: var(--color-text); margin-bottom: var(--spacing-1);">Panel de Administración</h1>
          <p class="text-muted" style="margin: 0;">Administra contenido y gestiona usuarios</p>
        </div>
      </header>

      <div class="mb-8" style="max-width: 800px;">
        ${apiKeyHTML}
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        
        <!-- AI Generator -->
        <div class="card flex-col">
          <h3 class="flex items-center gap-2 mb-6" style="color: var(--color-primary-dark);">
            <i class="ph ph-magic-wand text-primary"></i> Generador de Lecciones IA
          </h3>
          
          <form id="ai-generator-form">
            <div class="form-group">
              <label class="form-label">Tema de la Lección</label>
              <input type="text" id="ai-tema" class="form-input" placeholder="Ej. Redes Neuronales Convolucionales" required />
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="form-group">
                <label class="form-label">Nivel</label>
                <select id="ai-nivel" class="form-input">
                  <option value="Principiante">Principiante / A0-A1</option>
                  <option value="Intermedio" selected>Intermedio / A2</option>
                  <option value="Avanzado">Avanzado / B1</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Tipo de Lección</label>
                <select id="ai-tipo" class="form-input">
                  <option value="Desarrollo de Software">Desarrollo de Software</option>
                  <option value="Inglés para IT">Inglés para IT</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Idioma Generación</label>
                <select id="ai-idioma" class="form-input">
                  <option value="es" selected>Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Orden en la Ruta (Opcional)</label>
              <input type="number" id="ai-orden" class="form-input" value="1" min="1" />
            </div>
            
            <button type="submit" id="generate-btn" class="btn btn-primary btn-block mt-4">
              <i class="ph ph-sparkle"></i> Generar y Guardar Lección
            </button>
          </form>
          
          <div id="ai-result" style="margin-top: var(--spacing-4); padding: var(--spacing-4); border-radius: var(--radius-md); display: none;"></div>
        </div>
        
        <!-- User Registration Form -->
        <div class="card flex-col">
          <h3 class="flex items-center gap-2 mb-6" style="color: var(--color-primary-dark);">
            <i class="ph ph-user-plus text-primary"></i> Registrar Nuevo Usuario
          </h3>
          
          <form id="register-user-form">
            <div class="form-group">
              <label class="form-label">Nombre Completo</label>
              <input type="text" id="reg-nombre" class="form-input" placeholder="Juan Coder" required />
            </div>
            <div class="form-group">
              <label class="form-label">Correo Electrónico</label>
              <input type="email" id="reg-email" class="form-input" placeholder="juan@vaharca.com" required />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input type="password" id="reg-password" class="form-input" required minlength="6" />
              </div>
              <div class="form-group">
                <label class="form-label">Edad</label>
                <input type="number" id="reg-edad" class="form-input" value="18" min="5" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Rol del Usuario</label>
              <select id="reg-rol" class="form-input">
                <option value="CODER">Estudiante (CODER)</option>
                <option value="TEAM_LEADER">Administrador (TEAM LEADER)</option>
              </select>
            </div>
            
            <button type="submit" id="reg-btn" class="btn btn-secondary btn-block mt-4" style="background: var(--color-text); color: white;">
              <i class="ph ph-user-circle-plus"></i> Crear Cuenta
            </button>
          </form>
          <div id="reg-result" style="margin-top: var(--spacing-4); padding: var(--spacing-4); border-radius: var(--radius-md); display: none;"></div>
        </div>

      </div>

      <!-- Quick Stats -->
      <div class="mt-8">
        <h3 class="mb-4">Métricas Globales</h3>
        <div class="grid grid-cols-3 gap-6">
          <div class="card text-center py-6">
            <i class="ph ph-users text-3xl text-primary mb-2"></i>
            <div class="text-3xl font-bold mb-1" id="stat-estudiantes">...</div>
            <div class="text-sm text-muted">Estudiantes Activos</div>
          </div>
          <div class="card text-center py-6">
            <i class="ph ph-books text-3xl text-primary mb-2"></i>
            <div class="text-3xl font-bold mb-1" id="stat-lecciones">...</div>
            <div class="text-sm text-muted">Lecciones Totales</div>
          </div>
          <div class="card text-center py-6">
            <i class="ph ph-chart-line-up text-3xl text-primary mb-2"></i>
            <div class="text-3xl font-bold mb-1" id="stat-aprobacion">...</div>
            <div class="text-sm text-muted">Aprobación</div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Lógica del formulario de API Key (Común a ambos) ---
  const apiKeyForm = container.querySelector('#apikey-form');
  const apiKeyBtn = container.querySelector('#apikey-btn');
  const apiKeyResultDiv = container.querySelector('#apikey-result');

  if (apiKeyForm) {
    apiKeyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const apiKey = container.querySelector('#apikey-input').value.trim();
      
      try {
        apiKeyBtn.disabled = true;
        apiKeyBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>...';
        
        const data = await fetchApi('/usuarios/me/apikey', {
          method: 'PUT',
          body: JSON.stringify({ api_key: apiKey })
        });
        
        apiKeyResultDiv.style.display = 'block';
        apiKeyResultDiv.style.color = 'var(--color-success)';
        apiKeyResultDiv.innerHTML = `¡API Key guardada correctamente!`;
        
        // Actualizar usuario en local storage
        AuthUtils.updateUser({ gemini_api_key: apiKey });
        
        setTimeout(() => apiKeyResultDiv.style.display = 'none', 3000);
      } catch (error) {
        apiKeyResultDiv.style.display = 'block';
        apiKeyResultDiv.style.color = 'var(--color-danger)';
        apiKeyResultDiv.innerHTML = `Error: ${error.message}`;
      } finally {
        apiKeyBtn.disabled = false;
        apiKeyBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Guardar';
      }
    });
  }

  // --- Logic for AI Generator ---
  const aiForm = container.querySelector('#ai-generator-form');
  const aiBtn = container.querySelector('#generate-btn');
  const aiResultDiv = container.querySelector('#ai-result');

  if (aiForm) {
    aiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lessonData = {
      tema: container.querySelector('#ai-tema').value,
      nivel: container.querySelector('#ai-nivel').value,
      tipo: container.querySelector('#ai-tipo').value,
      idioma: container.querySelector('#ai-idioma').value,
      orden: parseInt(container.querySelector('#ai-orden').value) || 1
    };
    
    try {
      aiBtn.disabled = true;
      aiBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Generando...';
      const newLesson = await AIService.generateLesson(lessonData);
      aiResultDiv.style.display = 'block';
      aiResultDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      aiResultDiv.style.color = 'var(--color-success)';
      aiResultDiv.innerHTML = `¡Lección "${newLesson.titulo}" guardada!`;
      aiForm.reset();
      loadStats();
    } catch (error) {
      aiResultDiv.style.display = 'block';
      aiResultDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      aiResultDiv.style.color = 'var(--color-danger)';
      aiResultDiv.innerHTML = `Error: ${error.message}`;
    } finally {
      aiBtn.disabled = false;
      aiBtn.innerHTML = '<i class="ph ph-sparkle"></i> Generar y Guardar Lección';
    }
  });
  }

  // --- Logic for User Registration ---
  const regForm = container.querySelector('#register-user-form');
  const regBtn = container.querySelector('#reg-btn');
  const regResultDiv = container.querySelector('#reg-result');

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
    const payload = {
      nombre: container.querySelector('#reg-nombre').value,
      email: container.querySelector('#reg-email').value,
      password: container.querySelector('#reg-password').value,
      edad: parseInt(container.querySelector('#reg-edad').value) || 0,
      rol: container.querySelector('#reg-rol').value
    };
    
    try {
      regBtn.disabled = true;
      regBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Creando...';
      
      const data = await fetchApi('/registro', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      regResultDiv.style.display = 'block';
      regResultDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      regResultDiv.style.color = 'var(--color-success)';
      regResultDiv.innerHTML = `¡Usuario ${data.nombre} creado exitosamente como ${data.rol}!`;
      regForm.reset();
      loadStats(); // Update active students count
    } catch (error) {
      regResultDiv.style.display = 'block';
      regResultDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      regResultDiv.style.color = 'var(--color-danger)';
      regResultDiv.innerHTML = `Error: ${error.message}`;
    } finally {
      regBtn.disabled = false;
      regBtn.innerHTML = '<i class="ph ph-user-circle-plus"></i> Crear Cuenta';
    }
  });
  }

  // --- Logic for Actual Stats ---
  const loadStats = async () => {
    try {
      const stats = await fetchApi('/admin/stats');
      const statEstudiantes = container.querySelector('#stat-estudiantes');
      if (statEstudiantes) {
        statEstudiantes.innerText = stats.estudiantes_activos;
        container.querySelector('#stat-lecciones').innerText = stats.lecciones_totales;
        container.querySelector('#stat-aprobacion').innerText = stats.tasa_aprobacion + '%';
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  loadStats();

  return container;
};
