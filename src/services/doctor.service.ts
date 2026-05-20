import { db } from '../mock/db';

interface AvailabilitySlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  bio: string;
  contact: string;
  availability: AvailabilitySlot[];
}

interface DoctorFilters {
  specialty?: string;
  name?: string;
}

interface AvailabilityData {
  day: string;
  start_time: string;
  end_time: string;
}

const doctorService = {
  getAll: async (filters?: DoctorFilters) => {
    let result = await db.getAll<Doctor>('doctors');
    if (filters?.specialty) {
      result = result.filter((d) =>
        d.specialty.toLowerCase().includes(filters.specialty!.toLowerCase()),
      );
    }
    if (filters?.name) {
      result = result.filter((d) =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(filters.name!.toLowerCase()),
      );
    }
    return result;
  },

  getById: async (id: number) => {
    return db.getById<Doctor>('doctors', id);
  },

  getAvailability: async (doctorId: number) => {
    const doctor = await db.getById<Doctor>('doctors', doctorId);
    return doctor?.availability ?? [];
  },

  updateProfile: async (id: number, data: Partial<Doctor>) => {
    const updated = await db.update<Doctor>('doctors', id, data);
    return updated ?? null;
  },

  createAvailability: async (doctorId: number, data: AvailabilityData) => {
    const doctor = await db.getById<Doctor>('doctors', doctorId);
    if (!doctor) throw new Error('Doctor not found');
    const slots = doctor.availability ?? [];
    const newSlotId = slots.length > 0 ? Math.max(...slots.map((s) => s.id)) + 1 : 1;
    const newSlot = { id: newSlotId, ...data };
    await db.update<Doctor>('doctors', doctorId, {
      availability: [...slots, newSlot],
    });
    return newSlot;
  },

  deleteAvailability: async (doctorId: number, slotId: number) => {
    const doctor = await db.getById<Doctor>('doctors', doctorId);
    if (!doctor) throw new Error('Doctor not found');
    const slots = (doctor.availability ?? []).filter((s) => s.id !== slotId);
    await db.update<Doctor>('doctors', doctorId, { availability: slots });
    return { deleted: true, id: slotId };
  },
};

export default doctorService;
