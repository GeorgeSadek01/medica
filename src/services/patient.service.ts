import { db } from '../mock/db';

const patientService = {
  getProfile: async (_id: number) => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  updateProfile: async (id: number, data: Record<string, unknown>) => {
    const updated = await db.update('users', id, data);
    if (updated) {
      const safeUser = { ...updated } as Record<string, unknown>;
      delete safeUser.password;
      localStorage.setItem('user', JSON.stringify(safeUser));
      return safeUser;
    }
    return null;
  },
};

export default patientService;
