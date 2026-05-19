import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Publisher, PublisherType } from '../types';

interface PublisherFormProps {
  publisher?: Publisher | null;
  onSave: (publisher: Omit<Publisher, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const PublisherForm: React.FC<PublisherFormProps> = ({ publisher, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    fechaNacimiento: '',
    fechaBautismo: '',
    tipo: 'bautizado' as PublisherType,
    grupo: 0,
  });

  useEffect(() => {
    if (publisher) {
      setFormData({
        nombre: publisher.nombre,
        telefono: publisher.telefono,
        fechaNacimiento: publisher.fechaNacimiento || '',
        fechaBautismo: publisher.fechaBautismo || '',
        tipo: publisher.tipo,
        grupo: publisher.grupo,
      });
    }
  }, [publisher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.trim(),
      fechaNacimiento: formData.fechaNacimiento || '',
      fechaBautismo: formData.fechaBautismo || null,
      tipo: formData.tipo,
      grupo: formData.grupo,
    });
  };

  const tipoOptions = [
    { value: 'bautizado', label: 'Publicador Bautizado' },
    { value: 'no_bautizado', label: 'Publicador No Bautizado' },
    { value: 'auxiliar', label: 'Precursor Auxiliar' },
    { value: 'regular', label: 'Precursor Regular' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {publisher ? 'Editar Publicador' : 'Nuevo Publicador'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono Móvil
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1234567890 (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo
            </label>
            <input
              type="number"
              min={1}
              value={formData.grupo || ''}
              onChange={(e) => setFormData({ ...formData, grupo: e.target.value ? parseInt(e.target.value) : 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Número de grupo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              required
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as PublisherType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {tipoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Bautismo
            </label>
            <input
              type="date"
              value={formData.fechaBautismo}
              onChange={(e) => setFormData({ ...formData, fechaBautismo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-800 rounded-md hover:bg-blue-900 transition-colors"
            >
              {publisher ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublisherForm;