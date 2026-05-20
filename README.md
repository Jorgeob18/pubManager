# PubManager - Gestión de Publicadores del Grupo

**PubManager** es una aplicación web progresiva (PWA) diseñada específicamente para los superintendentes de grupo y sus auxiliares en las congregaciones de los Testigos de Jehovah. Su función principal es facilitar el registro y seguimiento de los publicadores, así como la generación de informes mensuales de actividades.

## Características

### 📋 Directorio de Publicadores
- Registro completo de publicadores: nombre, teléfono móvil, fecha de nacimiento, fecha de bautismo
- Clasificación por tipo: Publicador Bautizado, Publicador No Bautizado, Precursor Auxiliar, Precursor Regular
- Asignación por número de grupo
- CRUD completo (agregar, editar, eliminar)
- Búsqueda y filtrado por grupo
- Botón de WhatsApp para solicitar informes directamente

### 📊 Informe Mensual
- Selector de mes y año para consultar historico
- Registro de actividades por cada publicador:
  - ¿Tuvo actividad?
  - Cursos bíblicos impartidos
  - Horas de predicación (para auxiliares y regulares)
  - Observaciones
- Clasificación histórica: cada informe guarda el tipo de publicador que era en ese mes
- Resumen por categoría con totales

### 📈 Gráfico de Pastel
- Visualización de activos por tipo
- Indicador de quienes no reportaron (en rojo)
- Se incluye en los informes PDF e imagen

### 💾 Exportación
- **TXT**: Informe de texto simple
- **CSV**: Datos tabulares para hojas de cálculo
- **PDF**: Informe completo con gráfico
- **Imagen**: Captura del informe en formato PNG

### 🔄 Respaldo y Restauración
- Exportar todos los datos en formato JSON
- Restaurar datos desde un archivo de respaldo
- Útil para cambiar de dispositivo o recuperar información

### 📱 PWA (Aplicación Progresiva)
- Instalable en dispositivos móviles
- Funciona sin conexión a internet
- Actualizaciones automáticas
- Acceso rápido desde la pantalla de inicio

## Tecnologías Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Gráficos**: Chart.js + React-Chartjs-2
- **PDF**: jsPDF
- **Base de datos**: IndexedDB (almacenamiento local)
- **PWA**: Vite PWA Plugin + Workbox

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Jorgeob18/pubManager.git

# Entrar al directorio
cd pubmanager

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## Despliegue

El proyecto está configurado para desplegarse en Netlify:

1. Conectar el repositorio de GitHub en Netlify
2. Configurar:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Desplegar

## Privacidad y Seguridad

- ✅ Todos los datos se almacenan **localmente** en tu dispositivo
- ✅ **No se comparten datos** con servidores externos
- ✅ No requiere conexión a internet para funcionar
- ✅ Los datos pueden respaldarse y restaurarse manualmente

**Recomendación**: Realiza respaldos periódicos de tus datos exportándolos en formato JSON.

## Créditos

Desarrollado por: **@GeorgeDev**

---

*Versión 1.0.0 - PubManager*