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

interface AvailabilityBlock {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface DoctorRecord {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  availability: AvailabilityBlock[];
  bookedSlots: Record<string, string[]>;
}

function getWeekdayFromDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts.map((p) => parseInt(p, 10));
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'long' });
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function updateAvailabilityForBooking(
  availability: AvailabilityBlock[],
  weekday: string,
  bookedTime: string,
): AvailabilityBlock[] {
  const idx = availability.findIndex(
    (b) =>
      b.day === weekday &&
      timeToMinutes(bookedTime) >= timeToMinutes(b.start_time) &&
      timeToMinutes(bookedTime) < timeToMinutes(b.end_time),
  );
  if (idx === -1) return availability;

  const block = availability[idx];
  const blockStart = timeToMinutes(block.start_time);
  const blockEnd = timeToMinutes(block.end_time);
  const booked = timeToMinutes(bookedTime);
  const bookedEnd = booked + 60;

  const result = [...availability];

  if (booked === blockStart && bookedEnd >= blockEnd) {
    result.splice(idx, 1);
  } else if (booked === blockStart) {
    result[idx] = { ...block, start_time: minutesToTime(bookedEnd) };
  } else if (bookedEnd >= blockEnd) {
    result[idx] = { ...block, end_time: bookedTime };
  } else {
    const nextId =
      Math.max(...availability.map((b) => b.id), 0) + 1 + Math.floor(Math.random() * 1000);
    result[idx] = { ...block, end_time: bookedTime };
    result.splice(idx + 1, 0, {
      id: nextId,
      day: weekday,
      start_time: minutesToTime(bookedEnd),
      end_time: block.end_time,
    });
  }

  return result;
}

function restoreAvailabilityForCancellation(
  availability: AvailabilityBlock[],
  weekday: string,
  cancelledTime: string,
): AvailabilityBlock[] {
  const cancelledStart = timeToMinutes(cancelledTime);
  const cancelledEnd = cancelledStart + 60;

  const beforeIdx = availability.findIndex(
    (b) => b.day === weekday && timeToMinutes(b.end_time) === cancelledStart,
  );
  const afterIdx = availability.findIndex(
    (b) => b.day === weekday && timeToMinutes(b.start_time) === cancelledEnd,
  );

  const result = [...availability];

  if (beforeIdx !== -1 && afterIdx !== -1) {
    const merged = {
      id: result[beforeIdx].id,
      day: weekday,
      start_time: result[beforeIdx].start_time,
      end_time: result[afterIdx].end_time,
    };
    const hi = Math.max(beforeIdx, afterIdx);
    const lo = Math.min(beforeIdx, afterIdx);
    result.splice(hi, 1);
    result.splice(lo, 1, merged);
  } else if (beforeIdx !== -1) {
    result[beforeIdx] = { ...result[beforeIdx], end_time: minutesToTime(cancelledEnd) };
  } else if (afterIdx !== -1) {
    result[afterIdx] = { ...result[afterIdx], start_time: cancelledTime };
  } else {
    const nextId =
      Math.max(...availability.map((b) => b.id), 0) + 1 + Math.floor(Math.random() * 1000);
    result.push({
      id: nextId,
      day: weekday,
      start_time: cancelledTime,
      end_time: minutesToTime(cancelledEnd),
    });
  }

  return result;
}

const appointmentService = {
  getAll: async () => {
    return db.getAll<Appointment>('appointments');
  },

  getById: async (id: number) => {
    return db.getById<Appointment>('appointments', id);
  },

  book: async (
    data: BookAppointmentData & { patient?: number; patient_name?: string; time?: string },
  ) => {
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

    const doc = (await db.getById('doctors', data.doctor)) as unknown as DoctorRecord | null;
    const doctor_name = doc ? `${doc.first_name} ${doc.last_name}` : '';
    const specialty = doc ? doc.specialty : '';

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
    const appt = await db.getById<Appointment>('appointments', id);
    const updated = await db.update<Appointment>('appointments', id, { status: 'cancelled' });

    if (appt?.paid && appt.doctor && appt.time) {
      const doctor = (await db.getById('doctors', appt.doctor)) as unknown as DoctorRecord | null;
      if (doctor) {
        const weekday = getWeekdayFromDate(appt.date);
        const availability: AvailabilityBlock[] = doctor.availability ?? [];
        const updatedAvailability = restoreAvailabilityForCancellation(
          availability,
          weekday,
          appt.time,
        );

        const bookedSlots: Record<string, string[]> = doctor.bookedSlots ?? {};
        const dateKey = appt.date;
        if (bookedSlots[dateKey]) {
          bookedSlots[dateKey] = bookedSlots[dateKey].filter((t: string) => t !== appt.time);
          if (bookedSlots[dateKey].length === 0) delete bookedSlots[dateKey];
        }

        await db.update('doctors', appt.doctor, {
          availability: updatedAvailability,
          bookedSlots,
        });
      }
    }

    return updated ?? { id, status: 'cancelled' };
  },

  confirm: async (id: number) => {
    const updated = await db.update<Appointment>('appointments', id, {
      status: 'confirmed',
      paid: true,
    });

    if (updated) {
      const appt = updated;
      const doctor = (await db.getById('doctors', appt.doctor)) as unknown as DoctorRecord | null;
      if (doctor && appt.time) {
        const weekday = getWeekdayFromDate(appt.date);

        const availability: AvailabilityBlock[] = doctor.availability ?? [];
        const updatedAvailability = updateAvailabilityForBooking(availability, weekday, appt.time);

        const bookedSlots: Record<string, string[]> = doctor.bookedSlots ?? {};
        const dateKey = appt.date;
        const existing: string[] = bookedSlots[dateKey] ?? [];
        if (!existing.includes(appt.time)) {
          bookedSlots[dateKey] = [...existing, appt.time];
        }

        await db.update('doctors', appt.doctor, { availability: updatedAvailability, bookedSlots });
      }
    }

    return updated ?? { id, status: 'confirmed', paid: true };
  },

  reject: async (id: number, notes?: string) => {
    const appt = await db.getById<Appointment>('appointments', id);
    const updated = await db.update<Appointment>('appointments', id, {
      status: 'cancelled',
      doctor_notes: notes ?? '',
    });

    if (appt?.paid && appt.doctor && appt.time) {
      const doctor = (await db.getById('doctors', appt.doctor)) as unknown as DoctorRecord | null;
      if (doctor) {
        const weekday = getWeekdayFromDate(appt.date);
        const availability: AvailabilityBlock[] = doctor.availability ?? [];
        const updatedAvailability = restoreAvailabilityForCancellation(
          availability,
          weekday,
          appt.time,
        );

        const bookedSlots: Record<string, string[]> = doctor.bookedSlots ?? {};
        const dateKey = appt.date;
        if (bookedSlots[dateKey]) {
          bookedSlots[dateKey] = bookedSlots[dateKey].filter((t: string) => t !== appt.time);
          if (bookedSlots[dateKey].length === 0) delete bookedSlots[dateKey];
        }

        await db.update('doctors', appt.doctor, {
          availability: updatedAvailability,
          bookedSlots,
        });
      }
    }

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
