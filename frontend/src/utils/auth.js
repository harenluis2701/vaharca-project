const TOKEN_KEY = 'vaharca_token';
const USER_KEY = 'vaharca_user';

export const AuthUtils = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  updateUser: (updates) => {
    const user = AuthUtils.getUser();
    if (user) {
      const newUser = { ...user, ...updates };
      AuthUtils.setUser(newUser);
    }
  },
  removeUser: () => localStorage.removeItem(USER_KEY),
  
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
  
  logout: () => {
    AuthUtils.removeToken();
    AuthUtils.removeUser();
    window.location.hash = '#/login';
  }
};
