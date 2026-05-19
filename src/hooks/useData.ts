import { useState, useEffect, useCallback } from 'react';
import { publishers as publishersDB, reports as reportsDB, config as configDB, settings as settingsDB } from '../db';
import type { Publisher, MonthlyReport, GroupConfig, AppSettings } from '../types';
import { generateId } from '../utils/helpers';

export const usePublishers = () => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPublishers = useCallback(async () => {
    setLoading(true);
    const data = await publishersDB.getAll();
    setPublishers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPublishers();
  }, [loadPublishers]);

  const addPublisher = async (publisher: Omit<Publisher, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPublisher: Publisher = {
      ...publisher,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await publishersDB.add(newPublisher);
    await loadPublishers();
    return newPublisher;
  };

  const updatePublisher = async (publisher: Publisher) => {
    const updated = { ...publisher, updatedAt: new Date().toISOString() };
    await publishersDB.update(updated);
    await loadPublishers();
    return updated;
  };

  const deletePublisher = async (id: string) => {
    await publishersDB.delete(id);
    await loadPublishers();
  };

  const getPublisherById = async (id: string) => {
    return publishersDB.getById(id);
  };

  const getPublishersByGroup = async (grupo: number) => {
    return publishersDB.getByGroup(grupo);
  };

  return {
    publishers,
    loading,
    addPublisher,
    updatePublisher,
    deletePublisher,
    getPublisherById,
    getPublishersByGroup,
    refresh: loadPublishers,
  };
};

export const useReports = () => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const data = await reportsDB.getAll();
    setReports(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const addReport = async (report: Omit<MonthlyReport, 'id' | 'createdAt'>) => {
    const newReport: MonthlyReport = {
      ...report,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await reportsDB.add(newReport);
    await loadReports();
    return newReport;
  };

  const updateReport = async (report: MonthlyReport) => {
    await reportsDB.update(report);
    await loadReports();
    return report;
  };

  const deleteReport = async (id: string) => {
    await reportsDB.delete(id);
    await loadReports();
  };

  const getReportsByMonth = async (mes: string, _anio: number) => {
    const allReports = await reportsDB.getAll();
    return allReports.filter(r => r.mes === mes);
  };

  const getReportsByPublisher = async (publisherId: string) => {
    return reportsDB.getByPublisher(publisherId);
  };

  return {
    reports,
    loading,
    addReport,
    updateReport,
    deleteReport,
    getReportsByMonth,
    getReportsByPublisher,
    refresh: loadReports,
  };
};

export const useConfig = () => {
  const [config, setConfig] = useState<GroupConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      const data = await configDB.get();
      setConfig(data || null);
      setLoading(false);
    };
    loadConfig();
  }, []);

  const saveConfig = async (configData: GroupConfig) => {
    await configDB.save(configData);
    setConfig(configData);
  };

  return { config, loading, saveConfig };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await settingsDB.get();
      setSettings(data || null);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const saveSettings = async (settingsData: AppSettings) => {
    await settingsDB.save(settingsData);
    setSettings(settingsData);
  };

  return { settings, loading, saveSettings };
};