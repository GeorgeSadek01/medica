import seedDoctors from './doctors.json';
import seedAppointments from './appointments.json';

const DB_PREFIX = 'medica_db_';
const SEED_KEY = `${DB_PREFIX}_seeded`;

export type CollectionName = 'users' | 'doctors' | 'appointments' | 'specialties';

export interface Storable {
  id: number;
}

function getCollection<T extends Storable>(name: CollectionName): T[] {
  const raw = localStorage.getItem(`${DB_PREFIX}${name}`);
  return raw ? JSON.parse(raw) : [];
}

function saveCollection<T extends Storable>(name: CollectionName, data: T[]): void {
  localStorage.setItem(`${DB_PREFIX}${name}`, JSON.stringify(data));
}

function nextId<T extends Storable>(collection: T[]): number {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map((item) => item.id)) + 1;
}

function seed(): void {
  if (localStorage.getItem(SEED_KEY)) return;

  localStorage.setItem(`${DB_PREFIX}doctors`, JSON.stringify(seedDoctors));
  localStorage.setItem(`${DB_PREFIX}appointments`, JSON.stringify(seedAppointments));

  const doctorUsers: Array<{
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'doctor' | 'patient';
  }> = seedDoctors.map((doc) => ({
    id: doc.id,
    email: doc.contact,
    password: 'password123',
    first_name: doc.first_name,
    last_name: doc.last_name,
    role: 'doctor',
  }));
  doctorUsers.push({
    id: doctorUsers.length + 1,
    email: 'patient@medica.com',
    password: 'password123',
    first_name: 'Default',
    last_name: 'Patient',
    role: 'patient',
  });
  localStorage.setItem(`${DB_PREFIX}users`, JSON.stringify(doctorUsers));

  const specialties = [...new Set(seedDoctors.map((d) => d.specialty))].map((name, i) => ({
    id: i + 1,
    name,
  }));
  localStorage.setItem(`${DB_PREFIX}specialties`, JSON.stringify(specialties));

  localStorage.setItem(SEED_KEY, 'true');
}

seed();

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const db = {
  getAll: async <T extends Storable>(name: CollectionName): Promise<T[]> => {
    await delay(300);
    return getCollection<T>(name);
  },

  getById: async <T extends Storable>(name: CollectionName, id: number): Promise<T | null> => {
    await delay(200);
    const items = getCollection<T>(name);
    return items.find((item) => item.id === id) ?? null;
  },

  create: async <T extends Storable>(
    name: CollectionName,
    data: Record<string, unknown>,
  ): Promise<T> => {
    await delay(300);
    const collection = getCollection<T>(name);
    const newItem = { ...data, id: nextId(collection) } as T;
    collection.push(newItem);
    saveCollection(name, collection);
    return newItem;
  },

  update: async <T extends Storable>(
    name: CollectionName,
    id: number,
    data: Record<string, unknown>,
  ): Promise<T | null> => {
    await delay(250);
    const collection = getCollection<T>(name);
    const index = collection.findIndex((item) => item.id === id);
    if (index === -1) return null;
    collection[index] = { ...collection[index], ...data };
    saveCollection(name, collection);
    return collection[index];
  },

  delete: async (name: CollectionName, id: number): Promise<boolean> => {
    await delay(200);
    const collection = getCollection(name);
    const index = collection.findIndex((item) => item.id === id);
    if (index === -1) return false;
    collection.splice(index, 1);
    saveCollection(name, collection);
    return true;
  },

  query: async <T extends Storable>(
    name: CollectionName,
    predicate: (item: T) => boolean,
  ): Promise<T[]> => {
    await delay(200);
    const collection = getCollection<T>(name);
    return collection.filter(predicate);
  },

  find: async <T extends Storable>(
    name: CollectionName,
    predicate: (item: T) => boolean,
  ): Promise<T | null> => {
    await delay(150);
    const collection = getCollection<T>(name);
    return collection.find(predicate) ?? null;
  },
};
