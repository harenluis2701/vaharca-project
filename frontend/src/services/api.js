import { API_URL } from '../config/constants.js';
import { AuthUtils } from '../utils/auth.js';

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = AuthUtils.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Check if unauthorized
    if (response.status === 401) {
      AuthUtils.logout();
      throw new Error('Sesión expirada');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
