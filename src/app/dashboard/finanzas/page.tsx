import prisma from '@/lib/prisma';
import Link from 'next/link';
import styles from './page.module.css';

async function getFinanzasData() {
  const [transacciones, cuentas] = await Promise.all([
    prisma.transaccion.findMany({
      orderBy: { fecha: 'desc' },
    }),
    prisma.cuentaPendiente.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const ingresos = transacciones
    .filter(t => t.tipo === 'INGRESO')
    .reduce((sum, t) => sum + t.monto, 0);
  const gastos = transacciones
    .filter(t => t.tipo === 'GASTO')
    .reduce((sum, t) => sum + t.monto, 0);
  const presupuesto = ingresos - gastos;

  const montoReunidoTotal = cuentas.reduce((sum, c) => sum + c.montoReunido, 0);
  const montoTotalPendiente = cuentas.reduce((sum, c) => sum + c.montoTotal, 0);

  return {
    transacciones,
    cuentas,
    presupuesto,
    ingresos,
    gastos,
    montoReunidoTotal,
    montoTotalPendiente,
  };
}

export default async function FinanzasPage() {
  const data = await getFinanzasData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Finanzas</h1>
          <p className={styles.pageSubtitle}>Gestion financiera del club</p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Presupuesto Total</span>
            <span className={`${styles.summaryValue} ${data.presupuesto >= 0 ? styles.positive : styles.negative}`}>
              {formatCurrency(data.presupuesto)}
            </span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconSuccess}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Ingresos Totales</span>
            <span className={`${styles.summaryValue} ${styles.positive}`}>
              {formatCurrency(data.ingresos)}
            </span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconError}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Gastos Totales</span>
            <span className={`${styles.summaryValue} ${styles.negative}`}>
              {formatCurrency(data.gastos)}
            </span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIcon} ${styles.iconWarning}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Cuentas Pendientes</span>
            <span className={styles.summaryValue}>
              {formatCurrency(data.montoTotalPendiente)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Transacciones Recientes</h2>
          <Link href="/dashboard/finanzas/transaccion/nueva" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva Transaccion
          </Link>
        </div>

        {data.transacciones.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay transacciones registradas</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripcion</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.transacciones.slice(0, 10).map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.fecha)}</td>
                    <td>
                      <span className={`badge ${t.tipo === 'INGRESO' ? 'badge-success' : 'badge-error'}`}>
                        {t.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td>{t.descripcion}</td>
                    <td className={t.tipo === 'INGRESO' ? styles.amountPositive : styles.amountNegative}>
                      {t.tipo === 'INGRESO' ? '+' : '-'}{formatCurrency(t.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Cuentas Pendientes</h2>
          <Link href="/dashboard/finanzas/cuenta/nueva" className="btn btn-outline">
            Nueva Cuenta
          </Link>
        </div>

        {data.cuentas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay cuentas pendientes</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Descripcion</th>
                  <th>Monto Total</th>
                  <th>Monto Reunido</th>
                  <th>Progreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.cuentas.map((c) => {
                  const progreso = c.montoTotal > 0 ? (c.montoReunido / c.montoTotal) * 100 : 0;
                  return (
                    <tr key={c.id}>
                      <td>{c.descripcion}</td>
                      <td>{formatCurrency(c.montoTotal)}</td>
                      <td>{formatCurrency(c.montoReunido)}</td>
                      <td>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${Math.min(progreso, 100)}%` }}
                          ></div>
                        </div>
                        <span className={styles.progressText}>{progreso.toFixed(1)}%</span>
                      </td>
                      <td>
                        <span className={`badge ${progreso >= 100 ? 'badge-success' : 'badge-warning'}`}>
                          {progreso >= 100 ? 'Completado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
