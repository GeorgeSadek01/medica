import { db } from '../mock/db';

interface Appointment {
  id: number;
  doctor: number;
  doctor_name: string;
  specialty: string;
  patient: number;
  patient_name: string;
  date: string;
  time_slot: number | string;
  time: string;
  status: string;
  notes: string;
  doctor_notes: string;
  paid?: boolean;
}

interface BookAppointmentData {
  doctor: number;
  date: string;
  time_slot: number | string;
  notes?: string;
}

interface RescheduleData {
  date: string;
  time_slot: number | string;
}

const appointmentService = {
  getAll: async () => {
    return db.getAll<Appointment>('appointments');
  },

  getById: async (id: number) => {
    return db.getById<Appointment>('appointments', id);
  },

  book: async (data: BookAppointmentData & { patient?: number; patient_name?: string; time?: string }) => {
    // Guard: prevent a patient from booking the same doctor twice on the same day
    if (data.patient) {
      const existing = await db.getAll<Appointment>('appointments');
      const duplicate = existing.some(
        (ap) =>
          ap.doctor === data.doctor &&
          ap.date === data.date &&
          ap.patient === data.patient &&
          ap.status !== 'cancelled',
      );
      if (duplicate) {
        throw new Error('You already have an appointment with this doctor on this day.');
      }
    }

    // try to populate doctor_name and specialty from doctors collection
    const doc = await db.getById('doctors', data.doctor);
    const doctor_name = doc ? `${(doc as any).first_name} ${(doc as any).last_name}` : '';
    const specialty = doc ? (doc as any).specialty : '';

    return db.create<Appointment>('appointments', {
      doctor: data.doctor,
      doctor_name,
      specialty,
      patient: data.patient ?? 0,
      patient_name: data.patient_name ?? '',
      date: data.date,
      time_slot: data.time_slot,
      time: data.time ?? '',
      status: 'pending',
      paid: false,
      notes: data.notes ?? '',
      doctor_notes: '',
    });
  },

  cancel: async (id: number) => {
    const updated = await db.update<Appointment>('appointments', id, { status: 'cancelled' });
    return updated ?? { id, status: 'cancelled' };
  },

  confirm: async (id: number) => {
    // Mark appointment as confirmed + paid
    const updated = await db.update<Appointment>('appointments', id, { status: 'confirmed', paid: true });

    // Also persist the booked slot onto the doctor record so the slot is
    // reflected as unavailable even without scanning all appointments.
    if (updated) {
      const appt = updated as any;
      const doctor = await db.getById('doctors', appt.doctor);
      if (doctor) {
        const bookedSlots: Record<string, string[]> = (doctor as any).bookedSlots ?? {};
        const dateKey = appt.date as string;
        const existing: string[] = bookedSlots[dateKey] ?? [];
        if (appt.time && !existing.includes(appt.time)) {
          bookedSlots[dateKey] = [...existing, appt.time];
        }
        await db.update('doctors', appt.doctor, { bookedSlots });
      }
    }

    return updated ?? { id, status: 'confirmed', paid: true };
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
