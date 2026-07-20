import { AuthService } from '../services/authService.js';
import { ROUTES } from '../config/constants.js';
import { Router } from '../router/index.js';
import '../../css/style.css'; // Import the new CSS

export const Login = () => {
  const container = document.createElement('div');
  
  // This matches the login.html markup
  container.innerHTML = `
    <main class="login-container">
        
        <section class="login-form-section">
            
            <div class="brand-header">
                <div class="brand-logo">
                    <svg viewBox="0 0 24 24" class="logo-svg">
                        <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" class="hexagon" />
                        <path d="M12 6v12M9 9h6M8 12h8M9 15h6" class="brain-lines" />
                    </svg>
                </div>
                <span class="brand-name">VAHARCA</span>
            </div>

            <div class="form-wrapper">
                <div class="form-header">
                    <h1>Welcome Back</h1>
                    <p>Ingresa tus credenciales para continuar aprendiendo paso a paso.</p>
                </div>

                <form class="auth-form" id="loginForm">
                    <div class="input-group">
                        <label for="email">Correo Electrónico</label>
                        <div class="input-wrapper">
                            <span class="input-icon">@</span>
                            <input type="email" id="email" placeholder="coder@academia.com" required>
                        </div>
                    </div>

                    <div class="input-group">
                        <div class="label-row">
                            <label for="password">Contraseña</label>
                            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
                        </div>
                        <div class="input-wrapper">
                            <span class="input-icon">🔒</span>
                            <input type="password" id="password" placeholder="••••••••" required>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary" id="submit-btn">Iniciar Sesión</button>
                </form>

                <div class="divider">
                    <span>O continúa con</span>
                </div>

                <button class="btn-google">
                    <svg viewBox="0 0 24 24" class="google-icon">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z"/>
                    </svg>
                    Google
                </button>
            </div>

            <div class="form-footer">
                <p>¿No tienes una cuenta? <a href="#" class="register-link">Regístrate aquí</a></p>
            </div>

        </section>

        <section class="login-visual-section">
            <div class="gradient-overlay"></div>
            
            <div class="floating-badge badge-code" style="top: 15%; left: 15%;">
                <span>&lt;/&gt;</span>
            </div>
            <div class="floating-badge badge-ai" style="top: 25%; right: 15%;">
                <span>AI</span>
            </div>
            <div class="floating-badge badge-edu" style="bottom: 20%; left: 20%;">
                <span>🎓</span>
            </div>

            <div class="illustration-container">
                <div style="font-size: 4rem; text-align: center;">🧠</div>
            </div>

            <div class="visual-text">
                <h2>El 70% del éxito es tu curiosidad</h2>
                <p>Aprende desarrollo de software e inglés técnico de forma interactiva y guiada por IA.</p>
            </div>
        </section>

    </main>
  `;

  const form = container.querySelector('#loginForm');
  const submitBtn = container.querySelector('#submit-btn');
  // Need to find submit button by type submit since it didn't have an ID in the original html, I added id="submit-btn" in the innerHTML above.

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    
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

  return container.firstElementChild; // Return the <main> element directly instead of a wrapper <div>
};

