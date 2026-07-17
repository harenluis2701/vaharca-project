import { CourseService } from '../services/courseService.js';
import { ROUTES } from '../config/constants.js';

export const Courses = async () => {
  const container = document.createElement('div');
  container.className = 'animate-fade-in flex flex-col h-full';

  let currentView = 'courses';
  let allLecciones = [];

  const renderCoursesList = () => {
    container.innerHTML = `
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 style="color: var(--color-text); margin-bottom: var(--spacing-1);">Mis Cursos</h1>
          <p class="text-muted" style="margin: 0;">Selecciona una ruta para ver sus lecciones</p>
        </div>
      </header>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="card flex-col" style="cursor: pointer;" id="course-dev">
          <div style="height: 140px; background: linear-gradient(135deg, var(--color-primary-alpha) 0%, rgba(240,240,255,1) 100%); border-radius: var(--radius-md); margin-bottom: var(--spacing-4); display: flex; align-items: center; justify-content: center;">
             <i class="ph ph-code" style="font-size: 48px; color: var(--color-primary-light); opacity: 0.8;"></i>
          </div>
          <h3 style="font-size: 1.25rem; margin-bottom: var(--spacing-2);">Fundamentos Básicos de Programación</h3>
          <p class="text-sm text-muted mb-4">Aprende a programar desde cero con lógica, algoritmos y buenas prácticas.</p>
        </div>
        
        <div class="card flex-col" style="cursor: pointer;" id="course-eng">
          <div style="height: 140px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(240,255,240,1) 100%); border-radius: var(--radius-md); margin-bottom: var(--spacing-4); display: flex; align-items: center; justify-content: center;">
             <i class="ph ph-translate" style="font-size: 48px; color: var(--color-success); opacity: 0.8;"></i>
          </div>
          <h3 style="font-size: 1.25rem; margin-bottom: var(--spacing-2);">Inglés</h3>
          <p class="text-sm text-muted mb-4">Domina el vocabulario y la comunicación necesaria para la industria del software.</p>
        </div>
      </div>
    `;

    container.querySelector('#course-dev').addEventListener('click', () => {
      currentView = 'Desarrollo de Software';
      renderLessonsView();
    });
    
    container.querySelector('#course-eng').addEventListener('click', () => {
      currentView = 'Inglés para IT';
      renderLessonsView();
    });
  };

  const renderLessonsView = () => {
    container.innerHTML = `
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <button class="btn btn-secondary" style="padding: 0.5rem; border-radius: 50%;" id="btn-back">
            <i class="ph ph-arrow-left"></i>
          </button>
          <div>
            <h1 style="color: var(--color-text); margin-bottom: var(--spacing-1);">${currentView === 'Desarrollo de Software' ? 'Fundamentos Básicos de Programación' : 'Inglés'}</h1>
            <p class="text-muted" style="margin: 0;">Lecciones disponibles</p>
          </div>
        </div>
      </header>

      <div class="tabs-container" style="display: flex; gap: var(--spacing-4); margin-bottom: var(--spacing-8); border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-4);">
        <button id="tab-progress" class="btn btn-primary" style="border-radius: var(--radius-full);">En Progreso</button>
        <button id="tab-completed" class="btn btn-text" style="border-radius: var(--radius-full);">Completados</button>
      </div>

      <div id="courses-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    `;

    container.querySelector('#btn-back').addEventListener('click', () => {
      currentView = 'courses';
      renderCoursesList();
    });

    const viewLessons = allLecciones.filter(l => {
       const tipo = l.contenido_json?.tipo_curso || "Desarrollo de Software";
       return tipo === currentView;
    });

    const grid = container.querySelector('#courses-grid');
    
    const renderGrid = (filteredLecciones) => {
      if (filteredLecciones.length === 0) {
        grid.innerHTML = `
          <div class="card flex-col items-center justify-center text-center py-12" style="grid-column: 1 / -1;">
            <div style="width: 64px; height: 64px; background: var(--color-primary-alpha); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-primary); margin-bottom: var(--spacing-4);">
              <i class="ph ph-books" style="font-size: 32px;"></i>
            </div>
            <h3 style="margin-bottom: var(--spacing-2);">No hay lecciones aquí</h3>
            <p class="text-muted">No hay lecciones que coincidan con esta categoría.</p>
          </div>
        `;
        return;
      }
      
      grid.innerHTML = filteredLecciones.map(leccion => {
        let badgeClass = 'badge-primary';
        let statusText = 'Activo';
        if (leccion.estado === 'Aprobado') { badgeClass = 'badge-success'; statusText = 'Completado'; }
        if (leccion.estado === 'Reprobado') { badgeClass = 'badge-danger'; statusText = 'Por Repasar'; }
        
        const scoreText = leccion.calificacion_ia ? `<span class="text-xs" style="margin-left: 8px;">(Nota: ${leccion.calificacion_ia})</span>` : '';

        return `
        <div class="card flex-col" style="cursor: pointer;" onclick="window.location.hash='${ROUTES.LESSONS}?id=${leccion.id}'">
          <div style="height: 140px; background: linear-gradient(135deg, var(--color-primary-alpha) 0%, rgba(240,240,255,1) 100%); border-radius: var(--radius-md); margin-bottom: var(--spacing-4); display: flex; align-items: center; justify-content: center;">
             <i class="ph ph-graduation-cap" style="font-size: 48px; color: var(--color-primary-light); opacity: 0.8;"></i>
          </div>
          <span class="badge ${badgeClass} mb-2" style="align-self: flex-start;">${statusText} ${scoreText}</span>
          <h3 style="font-size: 1.125rem; margin-bottom: var(--spacing-2);">${leccion.titulo}</h3>
          <p class="text-sm text-muted mb-4" style="flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
             ${leccion.contenido_json?.introduccion || 'Aprende los fundamentos de este tema.'}
          </p>
          <div class="flex justify-between items-center pt-4" style="border-top: 1px solid var(--color-border);">
             <span class="text-sm font-medium"><i class="ph ph-list-numbers" style="vertical-align: middle;"></i> Orden: ${leccion.orden}</span>
             <button class="btn btn-text text-primary" style="padding: 0;">${statusText === 'Completado' ? 'Repasar' : 'Empezar'} <i class="ph ph-arrow-right"></i></button>
          </div>
        </div>
        `;
      }).join('');
    };

    renderGrid(viewLessons.filter(l => l.estado !== 'Aprobado'));

    const tabProgress = container.querySelector('#tab-progress');
    const tabCompleted = container.querySelector('#tab-completed');

    const setTabActive = (activeTab) => {
      [tabProgress, tabCompleted].forEach(t => {
        if(t) t.className = 'btn btn-text';
      });
      activeTab.className = 'btn btn-primary';
    };

    if (tabProgress) tabProgress.addEventListener('click', () => {
      setTabActive(tabProgress);
      renderGrid(viewLessons.filter(l => l.estado !== 'Aprobado'));
    });
    if (tabCompleted) tabCompleted.addEventListener('click', () => {
      setTabActive(tabCompleted);
      renderGrid(viewLessons.filter(l => l.estado === 'Aprobado'));
    });
  };

  renderCoursesList();

  CourseService.getLessons().then(lecciones => {
    allLecciones = lecciones;
  }).catch(error => {
    console.error(error);
  });

  return container;
};
