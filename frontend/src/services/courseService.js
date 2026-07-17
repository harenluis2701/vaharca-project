import { fetchApi } from './api.js';

export const CourseService = {
  getLessons: async () => {
    return await fetchApi('/lecciones');
  }
};
