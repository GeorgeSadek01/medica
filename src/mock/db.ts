import seedDoctors from './doctors.json';
import seedAppointments from './appointments.json';
import seedUsers from './users.json';

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
  if (localStorage.getItem(SEED_KEY)) {
    const currentDoctors = getCollection('doctors');
    if (currentDoctors.length > 0 && !('session_price' in currentDoctors[0])) {
      localStorage.setItem(`${DB_PREFIX}doctors`, JSON.stringify(seedDoctors));
    }
    return;
  }

  localStorage.setItem(`${DB_PREFIX}doctors`, JSON.stringify(seedDoctors));
  localStorage.setItem(`${DB_PREFIX}appointments`, JSON.stringify(seedAppointments));
  localStorage.setItem(`${DB_PREFIX}users`, JSON.stringify(seedUsers));

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

    const apiEndpoint = name === 'appointments' ? '/api/appointments' : name === 'users' ? '/api/users' : null;
    if (apiEndpoint) {
      try {
        await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
      } catch (e) {
        console.error(`Failed to save to ${name}.json`, e);
      }
    }
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

    const apiEndpoint = name === 'appointments' ? `/api/appointments/${id}` : name === 'users' ? `/api/users/${id}` : null;
    if (apiEndpoint) {
      try {
        await fetch(apiEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.error(`Failed to update ${name}.json`, e);
      }
    }
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
