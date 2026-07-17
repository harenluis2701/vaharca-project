import { AuthService } from '../services/authService.js';
import { ROUTES } from '../config/constants.js';
import { Router } from '../router/index.js';

export const Login = () => {
  const container = document.createElement('div');
  container.className = 'flex min-h-screen';
  container.style.backgroundColor = 'var(--color-background)';

  container.innerHTML = `
    <div style="flex: 1; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)); display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: var(--spacing-8); position: relative; overflow: hidden;">
      <div style="position: absolute; width: 600px; height: 600px; background: rgba(255,255,255,0.05); border-radius: 50%; top: -100px; right: -100px;"></div>
      <div style="position: absolute; width: 400px; height: 400px; background: rgba(255,255,255,0.05); border-radius: 50%; bottom: -50px; left: -100px;"></div>
      
      <div style="z-index: 1; text-align: center; max-width: 480px;">
        <h1 style="font-size: 3rem; margin-bottom: var(--spacing-4); color: white;">Domina la IA con<br/>VAHARCA</h1>
        <p style="font-size: 1.25rem; opacity: 0.9;">La plataforma de educación premium para desarrolladores modernos.</p>
      </div>
    </div>
    
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: var(--spacing-8); background: var(--color-white);">
      <div style="width: 100%; max-width: 400px;">
        <div style="text-align: center; margin-bottom: var(--spacing-8);">
          <h2 style="color: var(--color-primary-dark); font-size: 2rem; margin-bottom: var(--spacing-2);">VAHARCA</h2>
          <p class="text-muted">Bienvenido de nuevo. Por favor, introduce tus datos.</p>
        </div>
        
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Correo Electrónico</label>
            <input type="email" id="email" class="form-input" placeholder="Ingresa tu correo" required />
          </div>
          
          <div class="form-group">
            <div class="flex justify-between items-center mb-2">
              <label class="form-label" style="margin-bottom: 0;">Contraseña</label>
              <a href="#" style="font-size: 0.75rem;">¿Olvidaste tu contraseña?</a>
            </div>
            <input type="password" id="password" class="form-input" placeholder="••••••••" required />
          </div>
          
          <div class="flex items-center mb-6" style="margin-bottom: var(--spacing-6);">
            <input type="checkbox" id="remember" style="margin-right: 0.5rem;" />
            <label for="remember" style="font-size: 0.875rem; color: var(--color-text-muted);">Recordarme por 30 días</label>
          </div>
          
          <button type="submit" id="submit-btn" class="btn btn-primary btn-block mb-4">Iniciar Sesión</button>
          
          <div style="text-align: center; margin: var(--spacing-6) 0; position: relative;">
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--color-border);"></div>
            <span style="position: relative; background: var(--color-white); padding: 0 var(--spacing-4); font-size: 0.75rem; color: var(--color-text-muted);">O continúa con</span>
          </div>
          
          <button type="button" class="btn btn-secondary btn-block">
            <i class="ph-fill ph-google-logo" style="margin-right: 0.5rem;"></i> Continuar con Google
          </button>
        </form>
        
        <p style="text-align: center; margin-top: var(--spacing-8); font-size: 0.875rem; color: var(--color-text-muted);">
          ¿No tienes una cuenta? <a href="#" style="font-weight: 600;">Regístrate</a>
        </p>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const submitBtn = container.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Iniciando Sesión...';
      
      await AuthService.login(email, password);
      Router.navigate(ROUTES.DASHBOARD);
    } catch (error) {
      alert(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar Sesión';
    }
  });

  return container;
};
