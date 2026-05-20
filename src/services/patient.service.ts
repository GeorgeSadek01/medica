const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const patientService = {
  getProfile: async (_id: number) => {
    await delay(300);
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  updateProfile: async (_id: number, data: object) => {
    await delay(400);
    const stored = localStorage.getItem('user');
    const existing = stored ? JSON.parse(stored) : {};
    const updated = { ...existing, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  },
};

export default patientService;
