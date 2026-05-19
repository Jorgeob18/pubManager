import React from 'react';
import { Settings, Shield, Info } from 'lucide-react';
import { useSettings } from '../hooks/useData';

const Credits: React.FC = () => {
  const { settings } = useSettings();

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
              exportándolos en formato CSV para evitar pérdida de información.
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
            Gracias por utilizar esta aplicación. Para sugerencias oreportes de errores, 
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