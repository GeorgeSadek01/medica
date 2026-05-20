import mockDoctors from '../mock/doctors.json';
import mockAppointments from '../mock/appointments.json';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const adminService = {
  getAllUsers: async () => {
    await delay(500);
    return [...mockDoctors];
  },

  toggleUserStatus: async (id: number, isActive: boolean) => {
    await delay(400);
    return { id, is_active: isActive };
  },

  getSpecialties: async () => {
    await delay(400);
    const unique = [...new Set(mockDoctors.map((d) => d.specialty))];
    return unique.map((name, index) => ({ id: index + 1, name }));
  },

  createSpecialty: async (name: string) => {
    await delay(400);
    return { id: Math.floor(Math.random() * 1000), name };
  },

  editSpecialty: async (id: number, name: string) => {
    await delay(400);
    return { id, name };
  },

  deleteSpecialty: async (id: number) => {
    await delay(400);
    return { deleted: true, id };
  },

  getAllAppointments: async () => {
    await delay(500);
    return [...mockAppointments];
  },
};

export default adminService;
