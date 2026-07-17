export const API_URL = 'http://localhost:8000';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  LESSONS: '/lessons',
  TUTOR_IA: '/tutor',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
};

export const ROLES = {
  TEAM_LEADER: 'TEAM_LEADER',
  STUDENT: 'STUDENT', // Assuming this based on context, backend might just lack check for non-leaders
};
