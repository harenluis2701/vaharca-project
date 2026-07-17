import { AuthUtils } from '../utils/auth.js';
import { ROUTES } from '../config/constants.js';

export const Dashboard = async () => {
  const user = AuthUtils.getUser();
  const userName = user ? user.nombre : 'Developer';

  const container = document.createElement('div');
  container.className = 'animate-fade-in';
  
  container.innerHTML = `
    <header style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--spacing-8);">
      <div>
        <h1 style="color: var(--color-text); margin-bottom: var(--spacing-1);">Bienvenido de nuevo, ${userName}</h1>
        <p class="text-muted" style="margin: 0;">Llevas una racha de 5 días. ¡Sigue aprendiendo!</p>
      </div>
      <div style="display: flex; gap: var(--spacing-4);">
        <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 0.5rem 1rem; border-radius: var(--radius-full); display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600;">
          <i class="ph-fill ph-fire" style="color: var(--color-warning);"></i> 5 Días
        </div>
        <div style="background: var(--color-white); border: 1px solid var(--color-border); padding: 0.5rem 1rem; border-radius: var(--radius-full); display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600;">
          <i class="ph-fill ph-star" style="color: var(--color-primary);"></i> 2,450 XP
        </div>
      </div>
    </header>

    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <!-- AI Tutor Mini Card -->
      <div class="card flex-col" style="grid-column: span 3;">
        <div class="flex items-center gap-2 mb-4">
          <div style="width: 32px; height: 32px; background: var(--color-primary-alpha); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
            <i class="ph ph-brain" style="font-size: 20px;"></i>
          </div>
          <h3 style="font-size: 1.125rem; margin: 0;">Tutor VAHARCA</h3>
          <div style="width: 8px; height: 8px; background: var(--color-success); border-radius: 50%; margin-left: auto;"></div>
        </div>
        
        <div style="background: var(--color-background); border-radius: var(--radius-md); padding: var(--spacing-4); flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <p style="font-style: italic; font-size: 0.875rem; margin: 0;">"Ayer noté que tuviste problemas con useEffect. ¿Te gustaría repasar algunos ejemplos?"</p>
        </div>
        
        <div style="margin-top: var(--spacing-4); position: relative;">
          <input type="text" class="form-input" style="width: 100%; padding-right: 40px; cursor: pointer;" placeholder="Haz una pregunta de código..." onclick="window.location.hash='${ROUTES.TUTOR_IA}'" readonly />
          <button style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: var(--color-primary);">
            <i class="ph ph-paper-plane-right"></i>
          </button>
        </div>
      </div>
    </div>

  `;

  return container;
};
