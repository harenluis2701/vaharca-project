import { ROUTES } from '../config/constants.js';
import { AuthUtils } from '../utils/auth.js';
import { mount } from '../utils/dom.js';

// Import Pages
import { Login } from '../pages/Login.js';
import { Dashboard } from '../pages/Dashboard.js';
import { Courses } from '../pages/Courses.js';
import { Lessons } from '../pages/Lessons.js';
import { TutorIA } from '../pages/TutorIA.js';
import { Admin } from '../pages/Admin.js';
import { NotFound } from '../pages/NotFound.js';
import { Sidebar } from '../components/Sidebar.js';

const routes = {
  [ROUTES.LOGIN]: Login,
  [ROUTES.DASHBOARD]: Dashboard,
  [ROUTES.COURSES]: Courses,
  [ROUTES.LESSONS]: Lessons,
  [ROUTES.TUTOR_IA]: TutorIA,
  [ROUTES.ADMIN]: Admin,
};

export const Router = {
  init: () => {
    window.addEventListener('hashchange', Router.handleRoute);
    Router.handleRoute(); // initial load
  },

  navigate: (path) => {
    window.location.hash = path;
  },

  handleRoute: async () => {
    let fullPath = window.location.hash.slice(1) || ROUTES.DASHBOARD;
    const [path, queryString] = fullPath.split('?');
    const queryParams = new URLSearchParams(queryString || '');

    const isAuthRoute = path === ROUTES.LOGIN;
    const isAuthenticated = AuthUtils.isAuthenticated();

    if (!isAuthenticated && !isAuthRoute) {
      Router.navigate(ROUTES.LOGIN);
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      Router.navigate(ROUTES.DASHBOARD);
      return;
    }

    const PageComponent = routes[path] || NotFound;
    const appContainer = document.getElementById('app');

    if (isAuthRoute || path === '/404') {
      appContainer.innerHTML = '';
      appContainer.appendChild(await PageComponent(queryParams));
    } else {
      // Authenticated layout
      appContainer.innerHTML = `
        <div class="app-layout animate-fade-in">
          <div id="sidebar-container"></div>
          <main class="app-main">
            <div id="content-container" class="app-content"></div>
          </main>
        </div>
      `;
      mount('#sidebar-container', Sidebar(path));
      const content = await PageComponent(queryParams);
      mount('#content-container', content);
    }
  }
};
