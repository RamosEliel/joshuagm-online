/* eslint-disable @next/next/no-img-element */
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import styles from './page.module.css';

async function getBienes() {
  return await prisma.bien.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

const categoriaLabels: Record<string, string> = {
  ARTICULOS_ACAMPAR: 'Artículos de Acampar',
  EQUIPO_COCINA: 'Equipo de Cocina',
  HERRAMIENTAS: 'Herramientas',
  MATERIAL_DEPORTIVO: 'Material Deportivo',
  UTILES_ESCOLARES: 'Útiles Escolares',
  EQUIPO_PRIMEROS_AUXILIOS: 'Equipo de Primeros Auxilios',
  OTROS: 'Otros',
};

export default async function BienesPage() {
  const session = await getServerSession(authOptions);
  const canManage = !!session?.user?.rol && ['ADMINISTRADOR', 'GESTOR_BIENES'].includes(session.user.rol);
  const bienes = await getBienes();

  // Agrupar por categoría
  const bienesPorCategoria = bienes.reduce((acc, bien) => {
    const cat = bien.categoria || 'OTROS';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(bien);
    return acc;
  }, {} as Record<string, typeof bienes>);

  const categorias = Object.keys(bienesPorCategoria);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bienes del Club</h1>
          <p className={styles.pageSubtitle}>Inventario de bienes y equipos del club</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/bienes/uso-campamento" className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M3 20h18L12 4l-9 16z"/>
              <path d="M12 4v16"/>
            </svg>
            Uso en Campamentos
          </Link>
          {canManage && (
            <Link href="/dashboard/bienes/nuevo" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo Bien
            </Link>
          )}
        </div>
      </div>

      {bienes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No hay bienes registrados</h3>
          <p className={styles.emptyText}>Comienza agregando bienes al inventario del club</p>
          <Link href="/dashboard/bienes/nuevo" className="btn btn-primary">
            Agregar Bien
          </Link>
        </div>
      ) : (
        <div className={styles.bienesGrid}>
          {categorias.map((categoria) => (
            <div key={categoria} className={styles.tipoSection}>
              <h2 className={styles.tipoTitle}>{categoriaLabels[categoria] || categoria}</h2>
              <div className={styles.bienesCards}>
                {bienesPorCategoria[categoria].map((bien) => (
                  <div key={bien.id} className={styles.bienCard}>
                    {bien.imagenUrl && (
                      <div className={styles.bienImage}>
                        <img src={bien.imagenUrl} alt={bien.nombre} />
                      </div>
                    )}
                    <div className={styles.bienInfo}>
                      <h3 className={styles.bienName}>{bien.nombre}</h3>
                      {bien.tipo && (
                        <span className={styles.bienTipo}>{bien.tipo}</span>
                      )}
                      {bien.descripcion && (
                        <p className={styles.bienDesc}>{bien.descripcion}</p>
                      )}
                      <div className={styles.bienMeta}>
                        <span className={styles.bienCantidad}>
                          Cantidad: {bien.cantidad}
                        </span>
                      </div>
                    </div>
                      {canManage && (
                        <div className={styles.bienActions}>
                          <Link
                            href={`/dashboard/bienes/${bien.id}/editar`}
                            className={styles.actionBtn}
                            title="Editar"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
