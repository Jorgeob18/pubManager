export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateISO = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const getMonthName = (month: string): string => {
  const months: Record<string, string> = {
    '01': 'Enero',
    '02': 'Febrero',
    '03': 'Marzo',
    '04': 'Abril',
    '05': 'Mayo',
    '06': 'Junio',
    '07': 'Julio',
    '08': 'Agosto',
    '09': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre',
  };
  return months[month] || month;
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getMesAnioActual = (): { mes: string; anio: number } => {
  const now = new Date();
  return {
    mes: String(now.getMonth() + 1).padStart(2, '0'),
    anio: now.getFullYear(),
  };
};

export const getWhatsAppLink = (telefono: string, nombre: string, mes: string, anio: number): string => {
  const mensaje = `Hola ${nombre}, buen día 😊 espero que se encuentre muy bien. \n\nLe solicito por favor su informe de predicación del mes de ${getMonthName(mes)} de ${anio}.\n\nDe antemano muchas gracias y que Dios le bendiga 🙏`;
  const telefonoLimpio = telefono.replace(/\D/g, '');
  return `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
};

export const getPublisherTypeLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    bautizado: 'Bautizado',
    no_bautizado: 'No Bautizado',
    auxiliar: 'Precursor Auxiliar',
    regular: 'Precursor Regular',
  };
  return labels[tipo] || tipo;
};

export const getPublisherTypeColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    bautizado: 'bg-blue-100 text-blue-800',
    no_bautizado: 'bg-gray-100 text-gray-800',
    auxiliar: 'bg-green-100 text-green-800',
    regular: 'bg-purple-100 text-purple-800',
  };
  return colors[tipo] || 'bg-gray-100 text-gray-800';
};

export const groupPublishersByType = (publishers: any[]): any[] => {
  const tipoOrden = ['bautizado', 'no_bautizado', 'auxiliar', 'regular'];
  return [...publishers].sort((a, b) => {
    const indexA = tipoOrden.indexOf(a.tipo);
    const indexB = tipoOrden.indexOf(b.tipo);
    return indexA - indexB;
  });
};