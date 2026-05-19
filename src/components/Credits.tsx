import React, { useRef, useState } from 'react';
import { Settings, Shield, Info, Download, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSettings, usePublishers, useReports } from '../hooks/useData';
import { publishers as publishersDB, reports as reportsDB, settings as settingsDB } from '../db';

interface BackupData {
  version: string;
  exportDate: string;
  publishers: any[];
  reports: any[];
  settings: any;
}

const Credits: React.FC = () => {
  const { settings } = useSettings();
  const { publishers, refresh: refreshPublishers } = usePublishers();
  const { reports, refresh: refreshReports } = useReports();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  const handleBackup = () => {
    const backupData: BackupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      publishers: publishers,
      reports: reports,
      settings: settings,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pubmanager_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setBackupStatus({ type: 'success', message: 'Respaldo exportado exitosamente' });
    setTimeout(() => setBackupStatus({ type: '', message: '' }), 3000);
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);

      if (!data.version || !data.publishers) {
        throw new Error('Archivo de respaldo inválido');
      }

      const confirmRestore = confirm(
        '¿Estás seguro de restaurar el respaldo? Esto reemplazará todos los datos actuales. Se recomienda hacer un respaldo antes de continuar.'
      );

      if (!confirmRestore) return;

      for (const pub of data.publishers) {
        await publishersDB.add(pub);
      }

      if (data.reports && data.reports.length > 0) {
        for (const rep of data.reports) {
          await reportsDB.add(rep);
        }
      }

      if (data.settings) {
        await settingsDB.save(data.settings);
      }

      await refreshPublishers();
      await refreshReports();

      setBackupStatus({ type: 'success', message: 'Respaldo restaurado exitosamente. Por favor recarga la página.' });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error restoring:', error);
      setBackupStatus({ type: 'error', message: 'Error al restaurar: Archivo corrupto o inválido' });
      setTimeout(() => setBackupStatus({ type: '', message: '' }), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-8 h-8 text-blue-800 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Acerca de {settings?.appName || 'PubManager'}</h2>
        </div>

        <div className="space-y-4 text-gray-700">
          <p>
            Aplicación diseñada para la gestión de publicadores del grupo, 
            desarrollada específicamente para superintendentes de grupo y sus auxiliares.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Funcionalidades
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Registro y mantenimiento de directorio de publicadores</li>
              <li>Clasificación por tipo: Bautizados, No Bautizados, Precursores Auxiliares y Regulares</li>
              <li>Generación de informes mensuales de actividades</li>
              <li>Seguimiento de horas de prédica y cursos bíblicos</li>
              <li>Exportación de informes en múltiples formatos</li>
              <li>Funcionamiento offline (PWA)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Database className="w-8 h-8 text-purple-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Respaldo y Restauración</h3>
        </div>

        <div className="space-y-4 text-gray-700">
          <p className="text-sm">
            Exporta todos tus datos (publicadores e informes) en un archivo JSON para restaurar 
            en otro dispositivo o como respaldo de seguridad.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBackup}
              className="flex items-center justify-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar Respaldo
            </button>

            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleRestore}
                className="hidden"
                id="restore-input"
              />
              <label
                htmlFor="restore-input"
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 mr-2" />
                Restaurar Respaldo
              </label>
            </div>
          </div>

          {backupStatus.type === 'success' && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              {backupStatus.message}
            </div>
          )}

          {backupStatus.type === 'error' && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {backupStatus.message}
            </div>
          )}

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Recomendación:</strong> Haz respaldos periódicos de tus datos, especialmente 
              antes de cambiar de dispositivo o borrar datos del navegador.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-8 h-8 text-green-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Privacidad y Seguridad</h3>
        </div>

        <div className="space-y-3 text-gray-700">
          <p className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            Toda la información se almacena <strong>localmente</strong> en tu dispositivo
          </p>
          <p className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            <strong>No se comparten datos</strong> con servidores externos
          </p>
          <p className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            Los datos permanecen en tu navegador y pueden ser eliminados en cualquier momento
          </p>
          <p className="flex items-start">
            <span className="text-green-600 mr-2">✓</span>
            No se requiere conexión a internet para el funcionamiento de la aplicación
          </p>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Es importante realizar respaldos periódicos de tus datos 
              exportándolos en formato JSON para evitar pérdida de información.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Créditos</h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Desarrollador:</strong> {settings?.developerCredit || '@GeorgeDev'}
          </p>
          <p className="text-sm text-gray-500">
            Gracias por utilizar esta aplicación. Para sugerencias o reportes de errores, 
            contacta al desarrollador.
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 py-4">
        <p>Versión 1.0.0 - PubManager</p>
        <p className="mt-1">Todos los derechos reservados</p>
      </div>
    </div>
  );
};

export default Credits;