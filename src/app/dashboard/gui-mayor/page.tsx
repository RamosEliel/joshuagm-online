import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import styles from './page.module.css';

async function getGuiasMayores() {
  return await prisma.guiaMayor.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function GuiasMayoresPage() {
  const session = await getServerSession(authOptions);
  const canManage = !!session?.user?.rol && ['ADMINISTRADOR', 'TESORERO', 'GESTOR_BIENES'].includes(session.user.rol);
  const guiasMayores = await getGuiasMayores();

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      ACTIVO: 'badge-success',
      INACTIVO: 'badge-warning',
      SUSPENDIDO: 'badge-error',
    };
    return badges[estado] || 'badge-info';
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      ACTIVO: 'Activo',
      INACTIVO: 'Inactivo',
      SUSPENDIDO: 'Suspendido',
    };
    return labels[estado] || estado;
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Guias Mayores</h1>
          <p className={styles.pageSubtitle}>Gestion de la informacion de los guias mayores</p>
        </div>
        {canManage && (
          <Link href="/dashboard/gui-mayor/nuevo" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Guia Mayor
          </Link>
        )}
      </div>

      {guiasMayores.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No hay guias mayores registrados</h3>
          <p className={styles.emptyText}>Comienza agregando el primer guia mayor al sistema</p>
          {canManage && (
            <Link href="/dashboard/gui-mayor/nuevo" className="btn btn-primary">
              Agregar Guia Mayor
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Cargo</th>
                <th>Telefono</th>
                <th>Edad</th>
                <th>Campamentos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {guiasMayores.map((gm) => (
                <tr key={gm.id}>
                  <td>
                    <Link href={`/dashboard/gui-mayor/${gm.id}`} className={styles.gmName}>
                      {gm.nombres}
                    </Link>
                  </td>
                  <td>{gm.apellidos}</td>
                  <td>{gm.cargo}</td>
                  <td>{gm.telefono}</td>
                  <td>{gm.edad} años</td>
                  <td>{gm.participacionesCampamento}</td>
                  <td>
                    <span className={`badge ${getEstadoBadge(gm.estado)}`}>
                      {getEstadoLabel(gm.estado)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/dashboard/gui-mayor/${gm.id}`}
                        className={styles.actionBtn}
                        title="Ver detalles"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11-8-11 8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </Link>
                      {canManage && (
                        <Link
                          href={`/dashboard/gui-mayor/${gm.id}/editar`}
                          className={styles.actionBtn}
                          title="Editar"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
