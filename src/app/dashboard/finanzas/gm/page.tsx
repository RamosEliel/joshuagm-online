import prisma from '@/lib/prisma';
import Link from 'next/link';
import styles from './gm.module.css';

async function getFinanzasGM() {
  const guiasMayores = await prisma.guiaMayor.findMany({
    include: {
      finanzas: true,
    },
    orderBy: { nombres: 'asc' },
  });

  return guiasMayores;
}

export default async function FinanzasGMPage() {
  const guiasMayores = await getFinanzasGM();

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
          <h1 className={styles.pageTitle}>Finanzas por Guía Mayor</h1>
          <p className={styles.pageSubtitle}>Información financiera detallada de cada guía mayor</p>
        </div>
      </div>

      {guiasMayores.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay guías mayores registrados</p>
        </div>
      ) : (
        <div className={styles.gmGrid}>
          {guiasMayores.map((gm) => {
            const totalFinanzas = gm.finanzas.reduce((sum, f) => sum + f.valor, 0);
            const totalPagos = gm.finanzas.reduce((sum, f) => sum + f.pagosRealizados, 0);
            const pendiente = totalFinanzas - totalPagos;

            return (
              <div key={gm.id} className={styles.gmCard}>
                <div className={styles.gmHeader}>
                  <div className={styles.gmAvatar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className={styles.gmInfo}>
                    <h3 className={styles.gmName}>
                      {gm.nombres} {gm.apellidos}
                    </h3>
                    <p className={styles.gmCargo}>{gm.cargo}</p>
                  </div>
                  <Link
                    href={`/dashboard/gui-mayor/${gm.id}`}
                    className={styles.viewBtn}
                  >
                    Ver
                  </Link>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Finanzas</span>
                    <span className={styles.statValue}>{formatCurrency(totalFinanzas)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Pagos Realizados</span>
                    <span className={styles.statValuePositive}>{formatCurrency(totalPagos)}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Pendiente</span>
                    <span className={`${styles.statValue} ${pendiente > 0 ? styles.statValueWarning : ''}`}>
                      {formatCurrency(pendiente)}
                    </span>
                  </div>
                </div>

                {gm.finanzas.length > 0 && (
                  <div className={styles.finanzasList}>
                    <h4 className={styles.finanzasTitle}>Detalle de Finanzas</h4>
                    <ul className={styles.finanzasItems}>
                      {gm.finanzas.map((finanza) => (
                        <li key={finanza.id} className={styles.finanzaItem}>
                          <div className={styles.finanzaInfo}>
                            <span className={styles.finanzaTipo}>{finanza.tipo}</span>
                            <span className={styles.finanzaDesc}>{finanza.descripcion}</span>
                          </div>
                          <div className={styles.finanzaAmount}>
                            <span className={styles.amount}>{formatCurrency(finanza.valor)}</span>
                            {finanza.pagosRealizados > 0 && (
                              <span className={styles.pagado}>
                                - {formatCurrency(finanza.pagosRealizados)} pagado
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
