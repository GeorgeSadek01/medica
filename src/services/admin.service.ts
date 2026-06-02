import api from './api';

const adminService = {
  getAllUsers: async (params?: Record<string, string>) => {
    const res = await api.get('/users/', { params });
    return res.data;
  },

  getUserById: async (id: number) => {
    const res = await api.get(`/users/${id}/`);
    return res.data;
  },

  toggleUserStatus: async (id: number, isActive: boolean) => {
    const res = await api.patch(`/users/${id}/`, { is_active: isActive });
    return res.data;
  },

  softDeleteUser: async (id: number) => {
    const res = await api.delete(`/users/${id}/`, { data: { soft: true } });
    return res.data;
  },

  restoreUser: async (id: number) => {
    const res = await api.post(`/users/${id}/restore/`);
    return res.data;
  },

  makeAdmin: async (id: number) => {
    const res = await api.patch(`/users/${id}/`, { role: 'admin' });
    return res.data;
  },

  getSpecialties: async () => {
    const res = await api.get('/specialties/');
    return res.data;
  },

  createSpecialty: async (name: string) => {
    const res = await api.post('/specialties/', { name });
    return res.data;
  },

  editSpecialty: async (id: number, name: string) => {
    const res = await api.patch(`/specialties/${id}/`, { name });
    return res.data;
  },

  deleteSpecialty: async (id: number) => {
    const res = await api.delete(`/specialties/${id}/`);
    return res.data;
  },

  getAllAppointments: async (params?: Record<string, string>) => {
    const res = await api.get('/appointments/', { params });
    return res.data;
  },

  getAppointmentsByUser: async (userId: number, asDoctor = false) => {
    const params: Record<string, string> = {};
    if (asDoctor) {
      params.doctor = String(userId);
    } else {
      params.patient = String(userId);
    }
    const res = await api.get('/appointments/', { params });
    return res.data;
  },

  getDoctors: async () => {
    const res = await api.get('/users/', {
      params: { role: 'doctor', is_active: 'true' },
    });
    return res.data;
  },

  getPatients: async () => {
    const res = await api.get('/users/', {
      params: { role: 'patient', is_active: 'true' },
    });
    return res.data;
  },

  verifyDoctor: async (id: number, verified: boolean) => {
    const res = await api.patch(`/users/${id}/`, { verified });
    return res.data;
  },

  getUnverifiedDoctors: async () => {
    const res = await api.get('/users/', {
      params: { role: 'doctor', verified: 'false' },
    });
    return res.data;
  },

  getUnverifiedDoctorsCount: async () => {
    const doctors = await adminService.getUnverifiedDoctors();
    return doctors.length;
  },
};

export default adminService;
