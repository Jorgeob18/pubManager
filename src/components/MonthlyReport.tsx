import React, { useState, useRef } from 'react';
import { FileText, Download, X, Check, AlertCircle } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { usePublishers, useReports } from '../hooks/useData';
import type { Publisher, MonthlyReport, ReportData, ReportStats, PublisherReport } from '../types';
import { getMonthName, getPublisherTypeLabel } from '../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MonthlyReportProps {
  onExport?: (format: 'txt' | 'csv' | 'pdf' | 'imagen') => void;
}

const MonthlyReportComponent: React.FC<MonthlyReportProps> = () => {
  const { publishers } = usePublishers();
  const { reports, addReport, updateReport } = useReports();
  const [selectedMes, setSelectedMes] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const [selectedPublisherType, setSelectedPublisherType] = useState<string>('');
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const [reportForm, setReportForm] = useState({
    tuvoActividad: true,
    cursosBiblicos: 0,
    horasPredicacion: 0,
    observaciones: '',
  });

  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const anios = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const getReportForPublisher = (publisherId: string): MonthlyReport | undefined => {
    return reports.find(r => r.publisherId === publisherId && r.mes === selectedMes && r.anio === selectedAnio);
  };

  const generateReportData = (): ReportData => {
    const publicadores: PublisherReport[] = [];
    const auxiliares: PublisherReport[] = [];
    const regulares: PublisherReport[] = [];

    publishers.forEach(pub => {
      const report = getReportForPublisher(pub.id);
      const tipoEnElMes = report?.publisherType || pub.tipo;
      
      const pubReport: PublisherReport = {
        id: pub.id,
        nombre: pub.nombre,
        tipo: tipoEnElMes,
        grupo: pub.grupo,
        tuvoActividad: report?.tuvoActividad ?? false,
        cursosBiblicos: report?.cursosBiblicos ?? 0,
        horasPredicacion: report?.horasPredicacion,
        observaciones: report?.observaciones ?? '',
      };

      if (tipoEnElMes === 'auxiliar') {
        auxiliares.push(pubReport);
      } else if (tipoEnElMes === 'regular') {
        regulares.push(pubReport);
      } else {
        publicadores.push(pubReport);
      }
    });

    const stats: ReportStats = {
      totalPublicadores: publicadores.length,
      publicadoresActivos: publicadores.filter(p => p.tuvoActividad).length,
      totalCursosBiblicos: [...publicadores, ...auxiliares, ...regulares].reduce((sum, p) => sum + p.cursosBiblicos, 0),
      totalAuxiliares: auxiliares.length,
      auxiliaresActivos: auxiliares.filter(p => p.tuvoActividad).length,
      horasAuxiliares: auxiliares.reduce((sum, p) => sum + (p.horasPredicacion || 0), 0),
      cursosBiblicosAuxiliares: auxiliares.reduce((sum, p) => sum + p.cursosBiblicos, 0),
      totalRegulares: regulares.length,
      regularesActivos: regulares.filter(p => p.tuvoActividad).length,
      horasRegulares: regulares.reduce((sum, p) => sum + (p.horasPredicacion || 0), 0),
      cursosBiblicosRegulares: regulares.reduce((sum, p) => sum + p.cursosBiblicos, 0),
      noReportaron: [...publicadores, ...auxiliares, ...regulares].filter(p => !p.tuvoActividad).length,
    };

    return { publicadores, auxiliares, regulares, stats, mes: selectedMes, anio: selectedAnio };
  };

  const handleSaveReport = async () => {
    const existingReport = getReportForPublisher(selectedPublisher);
    const publisherType = selectedPublisherType || publishers.find(p => p.id === selectedPublisher)?.tipo || 'bautizado';

    if (existingReport) {
      await updateReport({
        ...existingReport,
        publisherType: publisherType as any,
        tuvoActividad: reportForm.tuvoActividad,
        cursosBiblicos: reportForm.cursosBiblicos,
        horasPredicacion: reportForm.horasPredicacion,
        observaciones: reportForm.observaciones,
      });
    } else {
      await addReport({
        publisherId: selectedPublisher,
        publisherType: publisherType as any,
        mes: selectedMes,
        anio: selectedAnio,
        tuvoActividad: reportForm.tuvoActividad,
        cursosBiblicos: reportForm.cursosBiblicos,
        horasPredicacion: reportForm.horasPredicacion,
        observaciones: reportForm.observaciones,
      });
    }

    setShowReportForm(false);
    setSelectedPublisher('');
    setReportForm({
      tuvoActividad: true,
      cursosBiblicos: 0,
      horasPredicacion: 0,
      observaciones: '',
    });
  };

  const openReportForm = (publisher: Publisher) => {
    const existingReport = getReportForPublisher(publisher.id);
    setSelectedPublisher(publisher.id);
    if (existingReport) {
      setSelectedPublisherType(existingReport.publisherType || publisher.tipo);
      setReportForm({
        tuvoActividad: existingReport.tuvoActividad,
        cursosBiblicos: existingReport.cursosBiblicos,
        horasPredicacion: existingReport.horasPredicacion || 0,
        observaciones: existingReport.observaciones,
      });
    } else {
      setSelectedPublisherType(publisher.tipo);
      setReportForm({
        tuvoActividad: true,
        cursosBiblicos: 0,
        horasPredicacion: 0,
        observaciones: '',
      });
    }
    setShowReportForm(true);
  };

  const generateChartData = () => {
    const reportData = generateReportData();
    return {
      labels: ['Publicadores Activos', 'Auxiliares Activos', 'Regulares Activos', 'No Reportaron'],
      datasets: [{
        data: [
          reportData.stats.publicadoresActivos,
          reportData.stats.auxiliaresActivos,
          reportData.stats.regularesActivos,
          reportData.stats.noReportaron,
        ],
        backgroundColor: ['#3b82f6', '#16a34a', '#9333ea', '#dc2626'],
        borderColor: ['#2563eb', '#15803d', '#7e22ce', '#b91c1c'],
        borderWidth: 2,
      }],
    };
  };

  const exportReport = async (format: 'txt' | 'csv' | 'pdf' | 'imagen') => {
    if (format === 'pdf' || format === 'imagen') {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const reportData = generateReportData();
    const monthName = getMonthName(selectedMes);

    if (format === 'txt') {
      let content = `INFORME MENSUAL - ${monthName} ${selectedAnio}\n`;
      content += '='.repeat(50) + '\n\n';
      content += `PUBLICADORES\n`;
      content += '-'.repeat(50) + '\n';
      reportData.publicadores.forEach(p => {
        content += `${p.nombre} - ${p.tuvoActividad ? 'Activo' : 'Sin Reporte'} - Cursos: ${p.cursosBiblicos}\n`;
      });
      content += `\nTotal Publicadores: ${reportData.stats.publicadoresActivos}/${reportData.stats.totalPublicadores}\n`;
      content += `Total Cursos Bíblicos: ${reportData.stats.totalCursosBiblicos}\n\n`;

      content += `PRECURSORES AUXILIARES\n`;
      content += '-'.repeat(50) + '\n';
      reportData.auxiliares.forEach(p => {
        content += `${p.nombre} - ${p.tuvoActividad ? 'Activo' : 'Sin Reporte'} - Horas: ${p.horasPredicacion || 0} - Cursos: ${p.cursosBiblicos}\n`;
      });
      content += `\nTotal Auxiliares: ${reportData.stats.auxiliaresActivos}/${reportData.stats.totalAuxiliares}\n`;
      content += `Total Horas: ${reportData.stats.horasAuxiliares}\n\n`;

      content += `PRECURSORES REGULARES\n`;
      content += '-'.repeat(50) + '\n';
      reportData.regulares.forEach(p => {
        content += `${p.nombre} - ${p.tuvoActividad ? 'Activo' : 'Sin Reporte'} - Horas: ${p.horasPredicacion || 0} - Cursos: ${p.cursosBiblicos}\n`;
      });
      content += `\nTotal Regulares: ${reportData.stats.regularesActivos}/${reportData.stats.totalRegulares}\n`;
      content += `Total Horas: ${reportData.stats.horasRegulares}\n`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_${monthName}_${selectedAnio}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === 'csv') {
      let csv = '';
      
      csv += `INFORME MENSUAL - ${monthName} ${selectedAnio}\n\n`;
      
      csv += 'PUBLICADORES\n';
      csv += 'Nombre,Grupo,Tuvo Actividad,Cursos Biblicos\n';
      reportData.publicadores.forEach(p => {
        csv += `"${p.nombre}",${p.grupo},${p.tuvoActividad ? 'Si' : 'No'},${p.cursosBiblicos}\n`;
      });
      csv += '\n';
      csv += `TOTAL ACTIVOS,${reportData.stats.publicadoresActivos}\n`;
      csv += `TOTAL PUBLICADORES,${reportData.stats.totalPublicadores}\n`;
      csv += `TOTAL CURSOS BIBLICOS,${reportData.stats.totalCursosBiblicos}\n\n`;
      
      csv += 'PRECURSORES AUXILIARES\n';
      csv += 'Nombre,Grupo,Tuvo Actividad,Horas,Cursos Biblicos\n';
      reportData.auxiliares.forEach(p => {
        csv += `"${p.nombre}",${p.grupo},${p.tuvoActividad ? 'Si' : 'No'},${p.horasPredicacion || 0},${p.cursosBiblicos}\n`;
      });
      csv += '\n';
      csv += `TOTAL ACTIVOS,${reportData.stats.auxiliaresActivos}\n`;
      csv += `TOTAL AUXILIARES,${reportData.stats.totalAuxiliares}\n`;
      csv += `TOTAL HORAS,${reportData.stats.horasAuxiliares}\n`;
      csv += `TOTAL CURSOS BIBLICOS,${reportData.auxiliares.reduce((sum, p) => sum + p.cursosBiblicos, 0)}\n\n`;
      
      csv += 'PRECURSORES REGULARES\n';
      csv += 'Nombre,Grupo,Tuvo Actividad,Horas,Cursos Biblicos\n';
      reportData.regulares.forEach(p => {
        csv += `"${p.nombre}",${p.grupo},${p.tuvoActividad ? 'Si' : 'No'},${p.horasPredicacion || 0},${p.cursosBiblicos}\n`;
      });
      csv += '\n';
      csv += `TOTAL ACTIVOS,${reportData.stats.regularesActivos}\n`;
      csv += `TOTAL REGULARES,${reportData.stats.totalRegulares}\n`;
      csv += `TOTAL HORAS,${reportData.stats.horasRegulares}\n`;
      csv += `TOTAL CURSOS BIBLICOS,${reportData.regulares.reduce((sum, p) => sum + p.cursosBiblicos, 0)}\n`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_${monthName}_${selectedAnio}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === 'pdf') {
      try {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPos = 15;
        
        pdf.setFontSize(18);
        pdf.text(`Informe de ${getMonthName(selectedMes)} ${selectedAnio}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
        
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 180);
        pdf.text('PUBLICADORES', 14, yPos);
        yPos += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        reportData.publicadores.forEach(p => {
          const status = p.tuvoActividad ? `Activo - Cursos: ${p.cursosBiblicos}` : 'SIN REPORTE';
          pdf.text(`${p.nombre} (G${p.grupo}): ${status}`, 14, yPos);
          yPos += 5;
        });
        
        yPos += 5;
        pdf.setFontSize(11);
        pdf.text(`Total Activos: ${reportData.stats.publicadoresActivos}/${reportData.stats.totalPublicadores}`, 14, yPos);
        yPos += 5;
        pdf.text(`Total Cursos Bíblicos: ${reportData.stats.totalCursosBiblicos}`, 14, yPos);
        yPos += 12;
        
        pdf.setFontSize(14);
        pdf.setTextColor(0, 100, 0);
        pdf.text('PRECURSORES AUXILIARES', 14, yPos);
        yPos += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        reportData.auxiliares.forEach(p => {
          const status = p.tuvoActividad 
            ? `Activo - Horas: ${p.horasPredicacion || 0} - Cursos: ${p.cursosBiblicos}` 
            : 'SIN REPORTE';
          pdf.text(`${p.nombre} (G${p.grupo}): ${status}`, 14, yPos);
          yPos += 5;
        });
        
        yPos += 5;
        pdf.setFontSize(11);
        pdf.text(`Total Activos: ${reportData.stats.auxiliaresActivos}/${reportData.stats.totalAuxiliares}`, 14, yPos);
        yPos += 5;
        pdf.text(`Total Horas: ${reportData.stats.horasAuxiliares}`, 14, yPos);
        yPos += 5;
        pdf.text(`Total Cursos Biblicos: ${reportData.stats.cursosBiblicosAuxiliares}`, 14, yPos);
        yPos += 12;
        
        pdf.setFontSize(14);
        pdf.setTextColor(128, 0, 128);
        pdf.text('PRECURSORES REGULARES', 14, yPos);
        yPos += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        reportData.regulares.forEach(p => {
          const status = p.tuvoActividad 
            ? `Activo - Horas: ${p.horasPredicacion || 0} - Cursos: ${p.cursosBiblicos}` 
            : 'SIN REPORTE';
          pdf.text(`${p.nombre} (G${p.grupo}): ${status}`, 14, yPos);
          yPos += 5;
        });
        
        yPos += 5;
        pdf.setFontSize(11);
        pdf.text(`Total Activos: ${reportData.stats.regularesActivos}/${reportData.stats.totalRegulares}`, 14, yPos);
        yPos += 5;
        pdf.text(`Total Horas: ${reportData.stats.horasRegulares}`, 14, yPos);
        yPos += 5;
        pdf.text(`Total Cursos Biblicos: ${reportData.stats.cursosBiblicosRegulares}`, 14, yPos);
        
        pdf.addPage();
        
        pdf.setFontSize(14);
        pdf.text('Resumen Grafico', pageWidth / 2, 30, { align: 'center' });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (chartInstanceRef.current) {
          try {
            const chartBase64 = chartInstanceRef.current.toBase64Image();
            if (chartBase64 && chartBase64.length > 0) {
              const chartWidth = 120;
              const chartHeight = 120;
              const chartX = (pageWidth - chartWidth) / 2;
              pdf.addImage(chartBase64, 'PNG', chartX, 50, chartWidth, chartHeight);
            } else {
              console.warn('Chart base64 is empty');
            }
          } catch (e) {
            console.error('Error adding chart to PDF:', e);
          }
        } else {
          console.warn('Chart ref is null');
        }
        
        pdf.save(`informe_${monthName}_${selectedAnio}.pdf`);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error al generar PDF. Intenta de nuevo.');
      }
    }

if (format === 'imagen') {
      try {
        if (!reportContainerRef.current) {
          alert('Error: No se encontró el elemento a exportar');
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const canvas = await html2canvas(reportContainerRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        
        if (!canvas) {
          throw new Error('Canvas is null');
        }
        
        const imgData = canvas.toDataURL('image/png');
        if (!imgData || imgData === 'data:,') {
          throw new Error('Image data is empty');
        }
        
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `informe_${monthName}_${selectedAnio}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('Error al generar imagen: ' + (error as Error).message);
      }
    }
  };

  const reportData = generateReportData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Informe Mensual</h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {meses.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {anios.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportReport('txt')}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            TXT
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button
            onClick={() => exportReport('imagen')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Imagen
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reportar Actividades</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {publishers.map(pub => {
            const report = getReportForPublisher(pub.id);
            return (
              <button
                key={pub.id}
                onClick={() => openReportForm(pub)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  report
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                }`}
              >
                <div className="font-medium text-gray-800">{pub.nombre}</div>
                <div className="text-sm text-gray-600">{getPublisherTypeLabel(pub.tipo)}</div>
                <div className={`text-xs mt-1 ${report ? 'text-green-600' : 'text-yellow-600'}`}>
                  {report ? 'Reportado' : 'Pendiente'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6" ref={reportContainerRef}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Informe de {getMonthName(selectedMes)} {selectedAnio}
          </h2>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 border-b-2 border-blue-800 pb-2">
            PUBLICADORES
          </h3>
          {reportData.publicadores.length === 0 ? (
            <p className="text-gray-500 italic">No hay publicadores registrados</p>
          ) : (
            <div className="space-y-2">
              {reportData.publicadores.map(p => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center p-3 rounded ${
                    !p.tuvoActividad ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <span className="font-medium">{p.nombre}</span>
                    <span className="text-sm text-gray-500 ml-2">- Grupo {p.grupo}</span>
                  </div>
                  <div className="text-right">
                    <span className={p.tuvoActividad ? 'text-green-600' : 'text-red-600 font-bold'}>
                      {p.tuvoActividad ? (
                        <>
                          <Check className="w-4 h-4 inline mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Sin Reporte
                        </>
                      )}
                    </span>
                    {p.tuvoActividad && (
                      <span className="text-sm text-gray-600 ml-2">
                        Cursos: {p.cursosBiblicos}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {reportData.publicadores.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded font-semibold">
              Total Activos: {reportData.stats.publicadoresActivos} / {reportData.stats.totalPublicadores} |
              Total Cursos Bíblicos: {reportData.stats.totalCursosBiblicos}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3 border-b-2 border-green-800 pb-2">
            PRECURSORES AUXILIARES
          </h3>
          {reportData.auxiliares.length === 0 ? (
            <p className="text-gray-500 italic">No hay precursores auxiliares registrados</p>
          ) : (
            <div className="space-y-2">
              {reportData.auxiliares.map(p => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center p-3 rounded ${
                    !p.tuvoActividad ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <span className="font-medium">{p.nombre}</span>
                    <span className="text-sm text-gray-500 ml-2">- Grupo {p.grupo}</span>
                  </div>
                  <div className="text-right">
                    <span className={p.tuvoActividad ? 'text-green-600' : 'text-red-600 font-bold'}>
                      {p.tuvoActividad ? (
                        <>
                          <Check className="w-4 h-4 inline mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Sin Reporte
                        </>
                      )}
                    </span>
                    {p.tuvoActividad && (
                      <span className="text-sm text-gray-600 ml-2">
                        Horas: {p.horasPredicacion || 0} | Cursos: {p.cursosBiblicos}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {reportData.auxiliares.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded font-semibold">
              Total Activos: {reportData.stats.auxiliaresActivos} / {reportData.stats.totalAuxiliares} |
              Total Horas: {reportData.stats.horasAuxiliares}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 border-b-2 border-purple-800 pb-2">
            PRECURSORES REGULARES
          </h3>
          {reportData.regulares.length === 0 ? (
            <p className="text-gray-500 italic">No hay precursores regulares registrados</p>
          ) : (
            <div className="space-y-2">
              {reportData.regulares.map(p => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center p-3 rounded ${
                    !p.tuvoActividad ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <span className="font-medium">{p.nombre}</span>
                    <span className="text-sm text-gray-500 ml-2">- Grupo {p.grupo}</span>
                  </div>
                  <div className="text-right">
                    <span className={p.tuvoActividad ? 'text-green-600' : 'text-red-600 font-bold'}>
                      {p.tuvoActividad ? (
                        <>
                          <Check className="w-4 h-4 inline mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Sin Reporte
                        </>
                      )}
                    </span>
                    {p.tuvoActividad && (
                      <span className="text-sm text-gray-600 ml-2">
                        Horas: {p.horasPredicacion || 0} | Cursos: {p.cursosBiblicos}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {reportData.regulares.length > 0 && (
            <div className="mt-3 p-3 bg-purple-50 rounded font-semibold">
              Total Activos: {reportData.stats.regularesActivos} / {reportData.stats.totalRegulares} |
              Total Horas: {reportData.stats.horasRegulares}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-md" ref={chartContainerRef}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Resumen Gráfico</h3>
            <Pie 
              ref={chartInstanceRef}
              data={generateChartData()} 
              options={{ 
                maintainAspectRatio: true,
                animation: false,
              }} 
            />
          </div>
        </div>
      </div>

      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Reportar Actividades</h2>
              <button onClick={() => setShowReportForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo en este mes
                </label>
                <select
                  value={selectedPublisherType}
                  onChange={(e) => setSelectedPublisherType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bautizado">Publicador Bautizado</option>
                  <option value="no_bautizado">Publicador No Bautizado</option>
                  <option value="auxiliar">Precursor Auxiliar</option>
                  <option value="regular">Precursor Regular</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Por defecto toma el tipo del directorio. Cambia solo si en este mes era diferente.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tuvoActividad"
                  checked={reportForm.tuvoActividad}
                  onChange={(e) => setReportForm({ ...reportForm, tuvoActividad: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="tuvoActividad" className="ml-2 text-gray-700">
                  Tuvo actividad este mes
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cursos Bíblicos
                </label>
                <input
                  type="number"
                  min="0"
                  value={reportForm.cursosBiblicos || ''}
                  onChange={(e) => setReportForm({ ...reportForm, cursosBiblicos: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              {['auxiliar', 'regular'].includes(selectedPublisherType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas de Predicación
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reportForm.horasPredicacion || ''}
                    onChange={(e) => setReportForm({ ...reportForm, horasPredicacion: e.target.value ? parseInt(e.target.value) : 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={reportForm.observaciones}
                  onChange={(e) => setReportForm({ ...reportForm, observaciones: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveReport}
                  className="px-4 py-2 text-white bg-blue-800 rounded-md hover:bg-blue-900"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReportComponent;