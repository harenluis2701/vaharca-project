import { fetchApi } from './api.js';
import { AuthUtils } from '../utils/auth.js';

export const AuthService = {
  login: async (email, password) => {
    const data = await fetchApi('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.access_token) {
      AuthUtils.setToken(data.access_token);
      AuthUtils.setUser(data.usuario);
    }
    
    return data;
  },

  register: async (userData) => {
    return await fetchApi('/registro', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
};
