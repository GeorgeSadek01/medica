import api from './api';

const patientService = {
  getProfile: async (id: number) => {
    const res = await api.get(`/users/${id}/`);
    return res.data;
  },

  updateProfile: async (id: number, data: Record<string, unknown>) => {
    const res = await api.patch(`/users/${id}/`, data);
    return res.data;
  },
};

export default patientService;
