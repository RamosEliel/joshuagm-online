import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function MisFinanzasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  if (session.user.rol !== 'GM') {
    redirect('/dashboard/finanzas');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { guiaMayorId: true, nombre: true },
  });

  if (!user?.guiaMayorId) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>No tienes un Guía Mayor asociado</h2>
          <p>Solicita al administrador que asocie tu cuenta a tu registro de Guía Mayor.</p>
        </div>
      </div>
    );
  }

  const [finanzas, cuentas] = await Promise.all([
    prisma.finanzaGM.findMany({
      where: { guiaMayorId: user.guiaMayorId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.cuentaPendiente.findMany({
      where: { guiaMayorId: user.guiaMayorId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalFinanzas = finanzas.reduce((sum, f) => sum + f.valor, 0);
  const totalPagos = finanzas.reduce((sum, f) => sum + f.pagosRealizados, 0);
  const totalPendiente = totalFinanzas - totalPagos;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Mis Finanzas</h1>
          <p className={styles.pageSubtitle}>Resumen de tus cuentas y pagos</p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Asignado</span>
          <span className={styles.summaryValue}>{formatCurrency(totalFinanzas)}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Subsanado</span>
          <span className={`${styles.summaryValue} ${styles.positive}`}>{formatCurrency(totalPagos)}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Pendiente</span>
          <span className={`${styles.summaryValue} ${totalPendiente > 0 ? styles.negative : styles.positive}`}>
            {formatCurrency(totalPendiente)}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Cuentas Pendientes</h2>
        {cuentas.length === 0 ? (
          <p className={styles.emptyText}>No tienes cuentas pendientes asignadas.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Monto Total</th>
                  <th>Monto Reunido</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((c) => (
                  <tr key={c.id}>
                    <td>{c.descripcion}</td>
                    <td>{formatCurrency(c.montoTotal)}</td>
                    <td>{formatCurrency(c.montoReunido)}</td>
                    <td>
                      <span className={`badge ${
                        c.estado === 'PAGADA'
                          ? 'badge-success'
                          : c.estado === 'PENDIENTE'
                          ? 'badge-warning'
                          : c.estado === 'VENCIDA'
                          ? 'badge-error'
                          : 'badge-info'
                      }`}>
                        {c.estado === 'PAGADA'
                          ? 'Pagada'
                          : c.estado === 'PENDIENTE'
                          ? 'Pendiente'
                          : c.estado === 'VENCIDA'
                          ? 'Vencida'
                          : 'Anulada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Detalle de Finanzas Personales</h2>
        {finanzas.length === 0 ? (
          <p className={styles.emptyText}>No hay registros financieros.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Valor</th>
                  <th>Pagado</th>
                </tr>
              </thead>
              <tbody>
                {finanzas.map((f) => (
                  <tr key={f.id}>
                    <td>{f.tipo}</td>
                    <td>{f.descripcion}</td>
                    <td>{formatCurrency(f.valor)}</td>
                    <td>{formatCurrency(f.pagosRealizados)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
