export type PublisherType = 'bautizado' | 'no_bautizado' | 'auxiliar' | 'regular';

export interface Publisher {
  id: string;
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
  fechaBautismo: string | null;
  tipo: PublisherType;
  grupo: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReport {
  id: string;
  publisherId: string;
  mes: string;
  anio: number;
  tuvoActividad: boolean;
  cursosBiblicos: number;
  horasPredicacion?: number;
  observaciones: string;
  createdAt: string;
}

export interface GroupConfig {
  id: string;
  numeroGrupo: number;
  nombreGrupo: string;
  nombreSuperintendente: string;
  nombreAuxiliar: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  appName: string;
  developerCredit: string;
  privacyMessage: string;
}

export type ExportFormat = 'txt' | 'csv' | 'pdf' | 'imagen';

export interface ReportStats {
  totalPublicadores: number;
  publicadoresActivos: number;
  totalCursosBiblicos: number;
  totalAuxiliares: number;
  auxiliaresActivos: number;
  horasAuxiliares: number;
  totalRegulares: number;
  regularesActivos: number;
  horasRegulares: number;
  noReportaron: number;
}

export interface ReportData {
  publicadores: PublisherReport[];
  auxiliares: PublisherReport[];
  regulares: PublisherReport[];
  stats: ReportStats;
  mes: string;
  anio: number;
}

export interface PublisherReport {
  id: string;
  nombre: string;
  tipo: PublisherType;
  grupo: number;
  tuvoActividad: boolean;
  cursosBiblicos: number;
  horasPredicacion?: number;
  observaciones: string;
}