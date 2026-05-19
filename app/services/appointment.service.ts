import api from './axios';
import mockAppointments from '../mock/appointments.json';

interface BookAppointmentData {
  doctor: number;
  date: string;
  time_slot: number;
  notes?: string;
}

interface RescheduleData {
  date: string;
  time_slot: number;
}

const appointmentService = {
  getAll: async () => {
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
  getById: async (id: number) => {
  try {
    const response = await api.get(`/appointments/${id}/`);
    return response.data;
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const appointment = mockAppointments.find((a) => a.id === id) ?? null;
        resolve(appointment);
      }, 400);
    });
  }
},
  book: async (data: BookAppointmentData) => {
    try {
      const response = await api.post('/appointments/', data);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Math.floor(Math.random() * 1000),
            ...data,
            status: 'pending',
            doctor_notes: '',
          });
        }, 600);
      });
    }
  },

  cancel: async (id: number) => {
    try {
      const response = await api.patch(`/appointments/${id}/`, { status: 'cancelled' });
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, status: 'cancelled' });
        }, 400);
      });
    }
  },

  confirm: async (id: number) => {
    try {
      const response = await api.patch(`/appointments/${id}/`, { status: 'confirmed' });
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, status: 'confirmed' });
        }, 400);
      });
    }
  },

  reject: async (id: number, notes?: string) => {
    try {
      const response = await api.patch(`/appointments/${id}/`, {
        status: 'cancelled',
        doctor_notes: notes,
      });
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, status: 'cancelled', doctor_notes: notes ?? '' });
        }, 400);
      });
    }
  },

  addNotes: async (id: number, notes: string) => {
    try {
      const response = await api.patch(`/appointments/${id}/`, { doctor_notes: notes });
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, doctor_notes: notes });
        }, 400);
      });
    }
  },

  reschedule: async (id: number, data: RescheduleData) => {
    try {
      const response = await api.patch(`/appointments/${id}/`, data);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, ...data, status: 'pending' });
        }, 500);
      });
    }
  },
};

export default appointmentService;