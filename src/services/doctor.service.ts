import api from './api';

const doctorService = {
  getAll: async (filters?: { specialty?: string; name?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.specialty) params.specialty = filters.specialty;
    if (filters?.name) params.name = filters.name;
    const res = await api.get('/doctors/', { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get(`/doctors/${id}/`);
    return res.data;
  },

  getAvailability: async (doctorId: number) => {
    const res = await api.get(`/doctors/${doctorId}/availability/`);
    return res.data;
  },

  updateProfile: async (id: number, data: Record<string, unknown>) => {
    const res = await api.patch(`/doctors/${id}/`, data);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api.get('/doctors/profile/me/');
    return res.data;
  },

  updateMyProfile: async (data: Record<string, unknown>) => {
    const res = await api.patch('/doctors/profile/me/', data);
    return res.data;
  },

  createAvailability: async (
    doctorId: number,
    data: { day: string; start_time: string; end_time: string },
  ) => {
    const res = await api.post(`/doctors/${doctorId}/availability/`, data);
    return res.data;
  },

  deleteAvailability: async (doctorId: number, slotId: number) => {
    const res = await api.delete(`/doctors/${doctorId}/availability/${slotId}/`);
    return res.data;
  },

  uploadDocuments: async (formData: FormData) => {
    const res = await api.post('/doctors/documents/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getDashboardData: async () => {
    const res = await api.get('/doctors/profile/dashboard/');
    return res.data;
  },
};

export default doctorService;
