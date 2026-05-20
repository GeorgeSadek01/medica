import { db } from '../mock/db';

interface Appointment {
  id: number;
  doctor: number;
  doctor_name: string;
  specialty: string;
  patient: number;
  patient_name: string;
  date: string;
  time_slot: number;
  time: string;
  status: string;
  notes: string;
  doctor_notes: string;
}

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
    return db.getAll<Appointment>('appointments');
  },

  getById: async (id: number) => {
    return db.getById<Appointment>('appointments', id);
  },

  book: async (data: BookAppointmentData) => {
    return db.create<Appointment>('appointments', {
      doctor: data.doctor,
      doctor_name: '',
      specialty: '',
      patient: 0,
      patient_name: '',
      date: data.date,
      time_slot: data.time_slot,
      time: '',
      status: 'pending',
      notes: data.notes ?? '',
      doctor_notes: '',
    });
  },

  cancel: async (id: number) => {
    const updated = await db.update<Appointment>('appointments', id, { status: 'cancelled' });
    return updated ?? { id, status: 'cancelled' };
  },

  confirm: async (id: number) => {
    const updated = await db.update<Appointment>('appointments', id, { status: 'confirmed' });
    return updated ?? { id, status: 'confirmed' };
  },

  reject: async (id: number, notes?: string) => {
    const updated = await db.update<Appointment>('appointments', id, {
      status: 'cancelled',
      doctor_notes: notes ?? '',
    });
    return updated ?? { id, status: 'cancelled', doctor_notes: notes ?? '' };
  },

  addNotes: async (id: number, notes: string) => {
    const updated = await db.update<Appointment>('appointments', id, { doctor_notes: notes });
    return updated ?? { id, doctor_notes: notes };
  },

  reschedule: async (id: number, data: RescheduleData) => {
    const updated = await db.update<Appointment>('appointments', id, {
      date: data.date,
      time_slot: data.time_slot,
      status: 'pending',
    });
    return updated ?? { id, ...data, status: 'pending' };
  },
};

export default appointmentService;
