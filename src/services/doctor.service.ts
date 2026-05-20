import mockDoctors from '../mock/doctors.json';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
    await delay(500);
    let result = [...mockDoctors];
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
    await delay(400);
    return mockDoctors.find((d) => d.id === id) ?? null;
  },

  getAvailability: async (doctorId: number) => {
    await delay(400);
    const doctor = mockDoctors.find((d) => d.id === doctorId);
    return doctor ? doctor.availability : [];
  },

  updateProfile: async (id: number, data: object) => {
    await delay(400);
    return { id, ...data };
  },

  createAvailability: async (data: AvailabilityData) => {
    await delay(400);
    return { id: Math.floor(Math.random() * 1000), ...data };
  },

  deleteAvailability: async (slotId: number) => {
    await delay(400);
    return { deleted: true, id: slotId };
  },
};

export default doctorService;
