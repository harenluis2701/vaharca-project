import { ROUTES } from '../config/constants.js';
import { AuthUtils } from '../utils/auth.js';

export const Sidebar = (currentPath) => {
  const container = document.createElement('aside');
  container.className = 'sidebar';
  container.style.width = '260px';
  container.style.backgroundColor = 'var(--color-white)';
  container.style.borderRight = '1px solid var(--color-border)';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.padding = 'var(--spacing-6) 0';

  const user = AuthUtils.getUser();
  const isAdmin = user && user.rol === 'TEAM_LEADER';

  const menuItems = [
    { name: 'Panel Principal', path: ROUTES.DASHBOARD, icon: 'ph-squares-four' },
    { name: 'Mis Cursos', path: ROUTES.COURSES, icon: 'ph-graduation-cap' },
    { name: 'Tutor IA', path: ROUTES.TUTOR_IA, icon: 'ph-brain' },
    { name: isAdmin ? 'Admin' : 'Mi Perfil', path: ROUTES.ADMIN, icon: isAdmin ? 'ph-gear' : 'ph-user' },
  ];

  container.innerHTML = `
    <div style="padding: 0 var(--spacing-6); margin-bottom: var(--spacing-8);">
      <div style="display: flex; align-items: center; gap: var(--spacing-3);">
        <div style="width: 32px; height: 32px; background: var(--color-primary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white;">
          <i class="ph ph-brain" style="font-size: 20px;"></i>
        </div>
        <h2 style="font-size: 1.25rem; margin: 0; color: var(--color-primary-dark);">VAHARCA</h2>
      </div>
      <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">Educación Premium</p
    </div>
    
    <nav style="flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 var(--spacing-4);">
      ${menuItems.map(item => `
        <a href="#${item.path}" class="nav-item ${currentPath === item.path ? 'active' : ''}">
          <i class="ph ${item.icon}"></i>
          ${item.name}
        </a>
      `).join('')}
    </nav>
    
    <div style="padding: var(--spacing-4) var(--spacing-6); margin-top: auto;">
      <button id="logout-btn" class="btn btn-secondary btn-block">
        <i class="ph ph-sign-out"></i> Salir
      </button>
    </div>

    <style>
      .nav-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        font-weight: 500;
        font-size: 0.875rem;
        transition: all var(--transition-fast);
      }
      .nav-item:hover {
        background-color: var(--color-primary-alpha);
        color: var(--color-primary);
      }
      .nav-item.active {
        background-color: var(--color-primary);
        color: var(--color-white);
      }
      .nav-item.active:hover {
        background-color: var(--color-primary-light);
        color: var(--color-white);
      }
      .nav-item i {
        font-size: 1.25rem;
      }
    </style>
  `;

  // Delegate logout
  container.querySelector('#logout-btn').addEventListener('click', () => {
    import('../utils/auth.js').then(({ AuthUtils }) => {
      AuthUtils.logout();
    });
  });

  return container;
};
