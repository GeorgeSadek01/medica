import api from './axios';
import mockDoctors from '../mock/doctors.json';
import mockAppointments from '../mock/appointments.json';

const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...mockDoctors]);
        }, 500);
      });
    }
  },

  toggleUserStatus: async (id: number, isActive: boolean) => {
    try {
      const response = await api.patch(`/users/${id}/`, { is_active: isActive });
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, is_active: isActive });
        }, 400);
      });
    }
  },

  getSpecialties: async () => {
    try {
      const response = await api.get('/specialties/');
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          const unique = [...new Set(mockDoctors.map((d) => d.specialty))];
          resolve(unique.map((name, index) => ({ id: index + 1, name })));
        }, 400);
      });
    }
  },

  createSpecialty: async (name: string) => {
    try {
      const response = await api.post('/specialties/', { name });
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Math.floor(Math.random() * 1000), name });
        }, 400);
      });
    }
  },
  editSpecialty: async (id: number, name: string) => {
  try {
    const response = await api.patch(`/specialties/${id}/`, { name });
    return response.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, name });
      }, 400);
    });
  }
},

  deleteSpecialty: async (id: number) => {
    try {
      const response = await api.delete(`/specialties/${id}/`);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ deleted: true, id });
        }, 400);
      });
    }
  },

  getAllAppointments: async () => {
    try {
      const response = await api.get('/appointments/');
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...mockAppointments]);
        }, 500);
      });
    }
  },
};

export default adminService;