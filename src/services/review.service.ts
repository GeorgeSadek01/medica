import api from './api';

const reviewService = {
  getDoctorReviews: async (doctorId: number) => {
    const res = await api.get(`/doctors/${doctorId}/reviews/`);
    return res.data;
  },

  createReview: async (doctorId: number, data: { appointment: number; rating: number; comment?: string }) => {
    const res = await api.post(`/doctors/${doctorId}/reviews/`, data);
    return res.data;
  },

  getMyReviews: async () => {
    const res = await api.get('/doctors/reviews/mine/');
    return res.data;
  },

  updateReview: async (id: number, data: { rating?: number; comment?: string }) => {
    const res = await api.patch(`/doctors/reviews/${id}/`, data);
    return res.data;
  },

  deleteReview: async (id: number) => {
    const res = await api.delete(`/doctors/reviews/${id}/`);
    return res.data;
  },
};

export default reviewService;
