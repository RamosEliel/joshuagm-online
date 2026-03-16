import prisma from '@/lib/prisma';
import Link from 'next/link';
import styles from './page.module.css';

async function getStats() {
  const [
    totalGM,
    gmActivos,
    totalBienes,
    totalActividades,
    transacciones,
  ] = await Promise.all([
    prisma.guiaMayor.count(),
    prisma.guiaMayor.count({ where: { estado: 'ACTIVO' } }),
    prisma.bien.count(),
    prisma.actividad.count(),
    prisma.transaccion.findMany({
      orderBy: { fecha: 'desc' },
      take: 5,
    }),
  ]);

  const transaccionesTotal = await prisma.transaccion.findMany();
  const ingresos = transaccionesTotal
    .filter(t => t.tipo === 'INGRESO')
    .reduce((sum, t) => sum + t.monto, 0);
  const gastos = transaccionesTotal
    .filter(t => t.tipo === 'GASTO')
    .reduce((sum, t) => sum + t.monto, 0);
  const presupuesto = ingresos - gastos;

  return {
    totalGM,
    gmActivos,
    totalBienes,
    totalActividades,
    presupuesto,
    ingresos,
    gastos,
    ultimasTransacciones: transacciones,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>Bienvenido al Sistema</h2>
        <p className={styles.welcomeSubtitle}>
          Gestiona la información de tu club de Guías Mayores de manera eficiente
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalGM}</span>
            <span className={styles.statLabel}>Total Guias Mayores</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.gmActivos}</span>
            <span className={styles.statLabel}>Guias Activos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalBienes}</span>
            <span className={styles.statLabel}>Bienes Registrados</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconInfo}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalActividades}</span>
            <span className={styles.statLabel}>Eventos Activos</span>
          </div>
        </div>
      </div>

      <div className={styles.financeSection}>
        <h3 className={styles.sectionTitle}>Resumen Financiero</h3>
        <div className={styles.financeCards}>
          <div className={styles.financeCard}>
            <span className={styles.financeLabel}>Presupuesto Total</span>
            <span className={`${styles.financeValue} ${stats.presupuesto >= 0 ? styles.positive : styles.negative}`}>
              {formatCurrency(stats.presupuesto)}
            </span>
          </div>
          <div className={styles.financeCard}>
            <span className={styles.financeLabel}>Ingresos</span>
            <span className={`${styles.financeValue} ${styles.positive}`}>
              {formatCurrency(stats.ingresos)}
            </span>
          </div>
          <div className={styles.financeCard}>
            <span className={styles.financeLabel}>Gastos</span>
            <span className={`${styles.financeValue} ${styles.negative}`}>
              {formatCurrency(stats.gastos)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Acciones Rapidas</h3>
        <div className={styles.actionsGrid}>
          <Link href="/dashboard/gui-mayor/nuevo" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <span className={styles.actionText}>Nuevo Guia Mayor</span>
          </Link>
          <Link href="/dashboard/finanzas" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className={styles.actionText}>Registrar Transaccion</span>
          </Link>
          <Link href="/dashboard/bienes" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span className={styles.actionText}>Agregar Bien</span>
          </Link>
          <Link href="/dashboard/eventos" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="12" y1="14" x2="12" y2="18"/>
                <line x1="10" y1="16" x2="14" y2="16"/>
              </svg>
            </div>
            <span className={styles.actionText}>Crear Evento</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
