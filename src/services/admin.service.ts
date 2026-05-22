import { db } from '../mock/db';

const adminService = {
  getAllUsers: async () => {
    return db.getAll('users');
  },

  getUserById: async (id: number) => {
    return db.getById('users', id);
  },

  toggleUserStatus: async (id: number, isActive: boolean) => {
    await db.update('users', id, { is_active: isActive });
    return { id, is_active: isActive };
  },

  softDeleteUser: async (id: number) => {
    await db.update('users', id, { is_active: false, deleted_at: new Date().toISOString() });
    return { id, is_active: false, deleted_at: new Date().toISOString() };
  },

  makeAdmin: async (id: number) => {
    await db.update('users', id, { role: 'admin' });
    return { id, role: 'admin' };
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

  getAppointmentsByUser: async (userId: number, asDoctor = false) => {
    const all = await db.getAll('appointments');
    return all.filter((a: any) =>
      asDoctor ? a.doctor === userId : a.patient === userId,
    );
  },

  getDoctors: async () => {
    const all = await db.getAll('users');
    return all.filter((u: any) => u.role === 'doctor' && u.is_active !== false);
  },

  getPatients: async () => {
    const all = await db.getAll('users');
    return all.filter((u: any) => u.role === 'patient' && u.is_active !== false);
  },

  verifyDoctor: async (id: number, verified: boolean) => {
    await db.update('users', id, { verified });
    return { id, verified };
  },

  getUnverifiedDoctors: async () => {
    const all = await db.getAll('users');
    return all.filter((u: any) => u.role === 'doctor' && u.verified !== true);
  },

  getUnverifiedDoctorsCount: async () => {
    const all = await db.getAll('users');
    return all.filter((u: any) => u.role === 'doctor' && u.verified !== true).length;
  },
};

export default adminService;
