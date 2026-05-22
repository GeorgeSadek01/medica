import { db } from '../mock/db';

const patientService = {
  getProfile: async (id: number) => {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored);
    return db.getById('users', id);
  },

  updateProfile: async (id: number, data: Record<string, unknown>) => {
    localStorage.setItem(
      'user',
      JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...data }),
    );
    return db.update('users', id, data);
  },
};

export default patientService;
