import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Publisher, MonthlyReport, GroupConfig, AppSettings } from '../types';

interface PubManagerDB extends DBSchema {
  publishers: {
    key: string;
    value: Publisher;
    indexes: { 'by-type': string; 'by-group': number };
  };
  reports: {
    key: string;
    value: MonthlyReport;
    indexes: { 'by-publisher': string; 'by-month': string };
  };
  config: {
    key: string;
    value: GroupConfig;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'pubmanager-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PubManagerDB>> | null = null;

export const getDB = async (): Promise<IDBPDatabase<PubManagerDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<PubManagerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('publishers')) {
          const publisherStore = db.createObjectStore('publishers', { keyPath: 'id' });
          publisherStore.createIndex('by-type', 'tipo');
          publisherStore.createIndex('by-group', 'grupo');
        }
        if (!db.objectStoreNames.contains('reports')) {
          const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportStore.createIndex('by-publisher', 'publisherId');
          reportStore.createIndex('by-month', 'mes');
        }
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const publishers = {
  async getAll(): Promise<Publisher[]> {
    const db = await getDB();
    return db.getAll('publishers');
  },
  async getById(id: string): Promise<Publisher | undefined> {
    const db = await getDB();
    return db.get('publishers', id);
  },
  async add(publisher: Publisher): Promise<string> {
    const db = await getDB();
    await db.put('publishers', publisher);
    return publisher.id;
  },
  async update(publisher: Publisher): Promise<string> {
    const db = await getDB();
    await db.put('publishers', publisher);
    return publisher.id;
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('publishers', id);
  },
  async getByGroup(grupo: number): Promise<Publisher[]> {
    const db = await getDB();
    return db.getAllFromIndex('publishers', 'by-group', grupo);
  },
  async getByType(tipo: string): Promise<Publisher[]> {
    const db = await getDB();
    return db.getAllFromIndex('publishers', 'by-type', tipo);
  },
};

export const reports = {
  async getAll(): Promise<MonthlyReport[]> {
    const db = await getDB();
    return db.getAll('reports');
  },
  async getById(id: string): Promise<MonthlyReport | undefined> {
    const db = await getDB();
    return db.get('reports', id);
  },
  async add(report: MonthlyReport): Promise<string> {
    const db = await getDB();
    await db.put('reports', report);
    return report.id;
  },
  async update(report: MonthlyReport): Promise<string> {
    const db = await getDB();
    await db.put('reports', report);
    return report.id;
  },
  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('reports', id);
  },
  async getByPublisher(publisherId: string): Promise<MonthlyReport[]> {
    const db = await getDB();
    return db.getAllFromIndex('reports', 'by-publisher', publisherId);
  },
  async getByMonth(mes: string, _anio: number): Promise<MonthlyReport[]> {
    const db = await getDB();
    const allReports = await db.getAll('reports');
    return allReports.filter(r => r.mes === mes);
  },
  async getByMonthYear(mes: string, _anio: number): Promise<MonthlyReport[]> {
    const db = await getDB();
    const allReports = await db.getAll('reports');
    return allReports.filter(r => r.mes === mes);
  },
};

export const config = {
  async get(): Promise<GroupConfig | undefined> {
    const db = await getDB();
    const configs = await db.getAll('config');
    return configs[0];
  },
  async save(configData: GroupConfig): Promise<string> {
    const db = await getDB();
    await db.put('config', configData);
    return configData.id;
  },
};

export const settings = {
  async get(): Promise<AppSettings | undefined> {
    const db = await getDB();
    const allSettings = await db.getAll('settings');
    if (allSettings.length === 0) {
      const defaultSettings: AppSettings = {
        id: 'default',
        appName: 'PubManager',
        developerCredit: '@GeorgeDev',
        privacyMessage: 'Toda la información se maneja localmente. No se comparten datos con terceros.',
      };
      const db = await getDB();
      await db.put('settings', defaultSettings);
      return defaultSettings;
    }
    return allSettings[0];
  },
  async save(settingsData: AppSettings): Promise<string> {
    const db = await getDB();
    await db.put('settings', settingsData);
    return settingsData.id;
  },
};