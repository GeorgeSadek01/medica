import api from './axios';

const patientService = {
  getProfile: async (id: number) => {
    try {
      const response = await api.get(`/users/${id}/`);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          const stored = localStorage.getItem('user');
          resolve(stored ? JSON.parse(stored) : null);
        }, 300);
      });
    }
  },

  updateProfile: async (id: number, data: object) => {
    try {
      const response = await api.patch(`/users/${id}/`, data);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          const stored = localStorage.getItem('user');
          const existing = stored ? JSON.parse(stored) : {};
          const updated = { ...existing, ...data };
          localStorage.setItem('user', JSON.stringify(updated));
          resolve(updated);
        }, 400);
      });
    }
  },
};

export default patientService;