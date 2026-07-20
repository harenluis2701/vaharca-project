import { CourseService } from '../services/courseService.js';
import { AIService } from '../services/aiService.js';
import { ROUTES } from '../config/constants.js';

export const Lessons = async (queryParams) => {
  const container = document.createElement('div');
  container.className = 'animate-fade-in flex flex-col h-full';
  
  try {
    const lessons = await CourseService.getLessons();
    
    if (!lessons || lessons.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-muted">No hay lecciones disponibles aún. Pide a tu Team Leader que genere una.</div>`;
      return container;
    }

    // Por defecto mostramos la última, pero si hay ID en la URL mostramos esa
    let currentLesson = lessons[lessons.length - 1];
    if (queryParams && queryParams.get('id')) {
      const lessonId = parseInt(queryParams.get('id'), 10);
      const foundLesson = lessons.find(l => l.id === lessonId);
      if (foundLesson) {
        currentLesson = foundLesson;
      }
    }
    const contenido = currentLesson.contenido_json || {};

    const title = contenido.titulo || currentLesson.titulo || "Lección";
    
    let theory = contenido.teoria_breve || contenido.teoria || "Contenido no disponible.";
    if (contenido.ejemplo_practico) {
      // Replace newlines with <br> for simple formatting, or let pre tag handle it
      theory += `<div style="margin-top: 1rem;"><strong>Ejemplo Práctico:</strong><br/><pre style="background: var(--color-background); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; font-family: monospace; font-size: 0.875rem; color: var(--color-text); margin-top: 0.5rem;">${contenido.ejemplo_practico}</pre></div>`;
    }
    
    const questions = contenido.preguntas_opcion_multiple || contenido.preguntas_evaluacion || [];
    const practice = contenido.ejercicio_practico || contenido.reto || "No hay ejercicio práctico.";

    let questionsHtml = '';
    if (questions.length > 0) {
      questionsHtml = questions.map((q, idx) => `
        <div class="mb-4">
          <p class="font-medium mb-2">${idx + 1}. ${q.pregunta}</p>
          <div class="flex flex-col gap-2">
            ${q.opciones.map(opt => {
              const safeOpt = opt.replace(/"/g, '&quot;');
              return `
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="q_${q.id}" value="${safeOpt}" class="form-radio" />
                <span>${opt}</span>
              </label>
              `;
            }).join('')}
          </div>
          <div id="feedback_q_${q.id}" style="display: none; margin-top: 8px; font-size: 0.875rem; font-weight: 500;"></div>
        </div>
      `).join('');
    }

    container.innerHTML = `
      <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-4); margin-bottom: var(--spacing-6);">
        <div class="flex items-center gap-4">
          <button class="btn btn-secondary" style="padding: 0.5rem; border-radius: 50%;" onclick="window.history.back()">
            <i class="ph ph-arrow-left"></i>
          </button>
          <div>
            <p class="text-sm text-muted font-medium" style="margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Vaharca 70/30</p>
            <h2 style="font-size: 1.25rem; margin: 0;">${title}</h2>
          </div>
        </div>
      </header>

      <div style="max-width: 800px; margin: 0 auto; width: 100%; padding: var(--spacing-4) 0; padding-bottom: 100px;">
        
        <h1 style="font-size: 2.5rem; margin-bottom: var(--spacing-6); letter-spacing: -0.02em;">${title}</h1>
        
        <!-- Teoría Breve -->
        <div style="background: var(--color-surface); padding: var(--spacing-6); border-radius: var(--radius-lg); margin-bottom: var(--spacing-8); box-shadow: var(--shadow-sm);">
          <h3 class="flex items-center gap-2 mb-4" style="color: var(--color-primary-dark);">
            <i class="ph ph-book-open text-xl"></i> Teoría Paso a Paso
          </h3>
          <p style="font-size: 1.125rem; color: var(--color-text); line-height: 1.8;">
            ${theory}
          </p>
        </div>

        <!-- Preguntas Rápidas -->
        ${questionsHtml ? `
        <div style="background: var(--color-white); border-left: 4px solid var(--color-primary); padding: var(--spacing-6); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); margin-bottom: var(--spacing-8);">
          <h3 style="display: flex; align-items: center; gap: 8px; margin-bottom: var(--spacing-4); font-size: 1.125rem; color: var(--color-primary-dark);">
            <i class="ph ph-question text-xl"></i> Comprueba tu lectura
          </h3>
          ${questionsHtml}
        </div>
        ` : ''}

        <!-- Ejercicio Interactivo -->
        <div class="card" style="margin-bottom: var(--spacing-8); border: 1px solid var(--color-primary-alpha);">
          <div class="flex justify-between items-center mb-4">
            <h3 class="flex items-center gap-2" style="margin: 0; font-size: 1.125rem;">
              <div style="width: 32px; height: 32px; background: var(--color-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="ph ph-code"></i>
              </div>
              Reto Práctico
            </h3>
          </div>
          
          <p style="font-weight: 500; margin-bottom: var(--spacing-4); color: var(--color-text);">
            ${practice}
          </p>
          
          <textarea id="coder-answer" class="form-input" rows="6" placeholder="Escribe tu código o respuesta aquí..." style="width: 100%; margin-bottom: var(--spacing-4); resize: vertical; font-family: monospace;"></textarea>
          
          <div id="eval-result" style="display: none; padding: var(--spacing-4); border-radius: var(--radius-md); margin-bottom: var(--spacing-4);"></div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-muted flex items-center gap-1"><i class="ph ph-magic-wand"></i> Tu respuesta será evaluada por la IA.</span>
            <button id="eval-btn" class="btn btn-primary">Evaluar <i class="ph ph-paper-plane-right"></i></button>
          </div>
        </div>

      </div>
    `;

    // Event listener para evaluar
    const evalBtn = container.querySelector('#eval-btn');
    if (evalBtn) {
      evalBtn.addEventListener('click', async () => {
        const answer = container.querySelector('#coder-answer').value;
        if (!answer.trim()) return alert("Por favor escribe tu respuesta antes de evaluar.");

        const resultDiv = container.querySelector('#eval-result');
        
        try {
          evalBtn.disabled = true;
          evalBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Evaluando...';
          resultDiv.style.display = 'none';

          const res = await AIService.evaluateExercise({
            leccion_id: currentLesson.id,
            respuesta: answer
          });

          resultDiv.style.display = 'block';
          if (res.resultado && res.resultado.error) {
            // Error del sistema o de la API
            resultDiv.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            resultDiv.style.border = '1px solid #f59e0b';
            resultDiv.style.color = '#92400e';
            
            resultDiv.innerHTML = `
              <strong><i class="ph ph-warning-circle"></i> Error de Conexión con IA</strong><br>
              <p style="margin-top: 0.5rem; margin-bottom: var(--spacing-4);">${res.resultado.feedback}</p>
              <button class="btn btn-secondary btn-block" onclick="window.location.hash='${ROUTES.COURSES}'">
                <i class="ph ph-arrow-left"></i> Volver a mis Cursos
              </button>
            `;
          } else {
            // Evaluación exitosa (puede ser aprobada o reprobada, pero la API funcionó)
            if (res.estado === 'Aprobado') {
              resultDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              resultDiv.style.border = '1px solid var(--color-success)';
              resultDiv.style.color = 'var(--color-success-dark, #065f46)';
            } else {
              resultDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              resultDiv.style.border = '1px solid var(--color-danger)';
              resultDiv.style.color = 'var(--color-danger-dark, #991b1b)';
            }

            resultDiv.innerHTML = `
              <strong>Estado: ${res.estado} (Nota: ${res.resultado.calificacion}/100)</strong><br>
              <p style="margin-top: 0.5rem; margin-bottom: var(--spacing-4);">
                <strong>💡 Explicación del Tutor IA:</strong><br>
                ${res.resultado.feedback}
              </p>
              <button class="btn btn-secondary btn-block" onclick="window.location.hash='${ROUTES.COURSES}'">
                <i class="ph ph-arrow-left"></i> Volver a mis Cursos
              </button>
            `;
          }

        } catch (error) {
          resultDiv.style.display = 'block';
          resultDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          resultDiv.innerHTML = `Error: ${error.message}`;
        } finally {
          evalBtn.disabled = false;
          evalBtn.innerHTML = 'Evaluar <i class="ph ph-paper-plane-right"></i>';
        }
      });
    }

    // Event listeners para las preguntas de opción múltiple
    if (questions.length > 0) {
      questions.forEach(q => {
        const radios = container.querySelectorAll(`input[name="q_${q.id}"]`);
        const feedbackDiv = container.querySelector(`#feedback_q_${q.id}`);
        
        radios.forEach(radio => {
          radio.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            // The value might be HTML escaped, so decode back to compare
            const unescapedValue = selectedValue.replace(/&quot;/g, '"');
            if (unescapedValue === q.respuesta_correcta || selectedValue === q.respuesta_correcta) {
              feedbackDiv.innerHTML = '<span style="color: var(--color-success);"><i class="ph ph-check-circle"></i> ¡Correcto!</span>';
              feedbackDiv.style.display = 'block';
            } else {
              feedbackDiv.innerHTML = '<span style="color: var(--color-danger);"><i class="ph ph-x-circle"></i> Incorrecto, intenta de nuevo.</span>';
              feedbackDiv.style.display = 'block';
            }
          });
        });
      });
    }

  } catch (error) {
    container.innerHTML = `<div class="p-8 text-center" style="color: var(--color-danger);">Error cargando lecciones: ${error.message}</div>`;
  }

  return container;
};
