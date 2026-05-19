import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MessageCircle, Search } from 'lucide-react';
import { usePublishers } from '../hooks/useData';
import type { Publisher } from '../types';
import PublisherForm from './PublisherForm';
import { formatDate, getPublisherTypeLabel, getPublisherTypeColor, getWhatsAppLink, getMesAnioActual } from '../utils/helpers';

const Directory: React.FC = () => {
  const { publishers, addPublisher, updatePublisher, deletePublisher, loading } = usePublishers();
  const [showForm, setShowForm] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | ''>('');

  const filteredPublishers = publishers.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === '' || p.grupo === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const grupos = [...new Set(publishers.map((p) => p.grupo))].sort();

  const handleSave = async (data: Omit<Publisher, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPublisher) {
      await updatePublisher({ ...editingPublisher, ...data });
    } else {
      await addPublisher(data);
    }
    setShowForm(false);
    setEditingPublisher(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este publicador?')) {
      await deletePublisher(id);
    }
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setShowForm(true);
  };

  const handleWhatsApp = (publisher: Publisher) => {
    const { mes, anio } = getMesAnioActual();
    const link = getWhatsAppLink(publisher.telefono, publisher.nombre, mes, anio);
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Directorio de Publicadores</h2>
        <button
          onClick={() => {
            setEditingPublisher(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Publicador
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar publicador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value ? parseInt(e.target.value) : '')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g} value={g}>Grupo {g}</option>
          ))}
        </select>
      </div>

      {filteredPublishers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay publicadores registrados
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPublishers.map((publisher) => (
            <div
              key={publisher.id}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{publisher.nombre}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPublisherTypeColor(publisher.tipo)}`}>
                    {getPublisherTypeLabel(publisher.tipo)}
                  </span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  Grupo {publisher.grupo}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>📱 {publisher.telefono || '-'}</p>
                <p>🎂 {formatDate(publisher.fechaNacimiento)}</p>
                <p>💧 {formatDate(publisher.fechaBautismo)}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  onClick={() => handleWhatsApp(publisher)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Solicitar informe por WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEdit(publisher)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(publisher.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PublisherForm
          publisher={editingPublisher}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPublisher(null);
          }}
        />
      )}
    </div>
  );
};

export default Directory;