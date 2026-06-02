import api from './api';

const appointmentService = {
  getAll: async (params?: Record<string, string | number>) => {
    const res = await api.get('/appointments/', { params });
    return Array.isArray(res.data) ? res.data : res.data.results;
  },

  getById: async (id: number) => {
    const res = await api.get(`/appointments/${id}/`);
    return res.data;
  },

  book: async (data: {
    doctor: number;
    date: string;
    time_slot: number | string;
    time: string;
    notes?: string;
    patient?: number;
    patient_name?: string;
  }) => {
    const res = await api.post('/appointments/', data);
    return res.data;
  },

  cancel: async (id: number) => {
    const res = await api.patch(`/appointments/${id}/`, { status: 'cancelled' });
    return res.data;
  },

  confirm: async (id: number) => {
    const res = await api.patch(`/appointments/${id}/`, { status: 'confirmed' });
    return res.data;
  },

  reject: async (id: number, notes?: string) => {
    const res = await api.patch(`/appointments/${id}/`, {
      status: 'cancelled',
      doctor_notes: notes ?? '',
    });
    return res.data;
  },

  complete: async (id: number, notes?: string) => {
    const payload: Record<string, unknown> = { status: 'completed' };
    if (notes !== undefined) payload.doctor_notes = notes;
    const res = await api.patch(`/appointments/${id}/`, payload);
    return res.data;
  },

  addNotes: async (id: number, notes: string) => {
    const res = await api.patch(`/appointments/${id}/`, { doctor_notes: notes });
    return res.data;
  },

  reschedule: async (
    id: number,
    data: { date: string; time_slot: number | string; time?: string },
  ) => {
    const res = await api.patch(`/appointments/${id}/`, {
      ...data,
      status: 'pending',
    });
    return res.data;
  },

  createPaymentSession: async (id: number) => {
    const res = await api.post(`/appointments/${id}/payment/`);
    return res.data;
  },

  confirmPayment: async (id: number, sessionId: string) => {
    const res = await api.post(`/appointments/${id}/confirm-payment/`, {
      session_id: sessionId,
    });
    return res.data;
  },
};

export default appointmentService;
