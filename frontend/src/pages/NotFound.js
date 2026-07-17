export const NotFound = () => {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center justify-center min-h-screen text-center';
  container.innerHTML = `
    <h1 style="font-size: 6rem; color: var(--color-primary); margin-bottom: 0;">404</h1>
    <h2 style="margin-bottom: var(--spacing-4);">Página no encontrada</h2>
    <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
    <a href="#/dashboard" class="btn btn-primary mt-4">Volver al inicio</a>
  `;
  return container;
};
