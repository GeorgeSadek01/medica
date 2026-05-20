import { db } from '../mock/db';

const adminService = {
  getAllUsers: async () => {
    return db.getAll('users');
  },

  toggleUserStatus: async (id: number, isActive: boolean) => {
    await db.update('users', id, { is_active: isActive });
    return { id, is_active: isActive };
  },

  getSpecialties: async () => {
    return db.getAll('specialties');
  },

  createSpecialty: async (name: string) => {
    return db.create('specialties', { name });
  },

  editSpecialty: async (id: number, name: string) => {
    await db.update('specialties', id, { name });
    return { id, name };
  },

  deleteSpecialty: async (id: number) => {
    await db.delete('specialties', id);
    return { deleted: true, id };
  },

  getAllAppointments: async () => {
    return db.getAll('appointments');
  },
};

export default adminService;
