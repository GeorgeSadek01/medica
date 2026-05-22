import { db } from '../mock/db';

const patientService = {
  getProfile: async (id: number) => {
    return db.getById('users', id);
  },

  updateProfile: async (id: number, data: Record<string, unknown>) => {
    return db.update('users', id, data);
  },
};

export default patientService;
