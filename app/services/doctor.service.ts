import api from './axios';
import mockDoctors from '../mock/doctors.json';

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
    try {
      const response = await api.get('/doctors/', { params: filters });
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          let result = [...mockDoctors];
          if (filters?.specialty) {
            result = result.filter((d) =>
              d.specialty.toLowerCase().includes(filters.specialty!.toLowerCase())
            );
          }
          if (filters?.name) {
            result = result.filter((d) =>
              `${d.first_name} ${d.last_name}`
                .toLowerCase()
                .includes(filters.name!.toLowerCase())
            );
          }
          resolve(result);
        }, 500);
      });
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`/doctors/${id}/`);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          const doctor = mockDoctors.find((d) => d.id === id) ?? null;
          resolve(doctor);
        }, 400);
      });
    }
  },

  getAvailability: async (doctorId: number) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/availability/`);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          const doctor = mockDoctors.find((d) => d.id === doctorId);
          resolve(doctor ? doctor.availability : []);
        }, 400);
      });
    }
  },

  updateProfile: async (id: number, data: object) => {
    try {
      const response = await api.patch(`/users/${id}/`, data);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id, ...data });
        }, 400);
      });
    }
  },

  createAvailability: async (data: AvailabilityData) => {
    try {
      const response = await api.post('/availability/', data);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Math.floor(Math.random() * 1000), ...data });
        }, 400);
      });
    }
  },

  deleteAvailability: async (slotId: number) => {
    try {
      const response = await api.delete(`/availability/${slotId}/`);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ deleted: true, id: slotId });
        }, 400);
      });
    }
  },
};

export default doctorService;