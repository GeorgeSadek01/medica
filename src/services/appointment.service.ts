import mockAppointments from '../mock/appointments.json';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
    await delay(500);
    return [...mockAppointments];
  },

  getById: async (id: number) => {
    await delay(400);
    const appointment = mockAppointments.find((a) => a.id === id) ?? null;
    return appointment;
  },

  book: async (data: BookAppointmentData) => {
    await delay(600);
    return {
      id: Math.floor(Math.random() * 1000),
      ...data,
      status: 'pending',
      doctor_notes: '',
    };
  },

  cancel: async (id: number) => {
    await delay(400);
    return { id, status: 'cancelled' };
  },

  confirm: async (id: number) => {
    await delay(400);
    return { id, status: 'confirmed' };
  },

  reject: async (id: number, notes?: string) => {
    await delay(400);
    return { id, status: 'cancelled', doctor_notes: notes ?? '' };
  },

  addNotes: async (id: number, notes: string) => {
    await delay(400);
    return { id, doctor_notes: notes };
  },

  reschedule: async (id: number, data: RescheduleData) => {
    await delay(500);
    return { id, ...data, status: 'pending' };
  },
};

export default appointmentService;
