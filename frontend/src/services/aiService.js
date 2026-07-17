import { fetchApi } from './api.js';

export const AIService = {
  generateLesson: async (lessonData) => {
    return await fetchApi('/generar-leccion', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  },
  evaluateExercise: async (evaluationData) => {
    return await fetchApi('/evaluar-ejercicio', {
      method: 'POST',
      body: JSON.stringify(evaluationData)
    });
  },
  chatTutor: async (messages) => {
    return await fetchApi('/tutor-chat', {
      method: 'POST',
      body: JSON.stringify({ mensajes: messages })
    });
  }
};
